"""
本地模型管理模块：负责加载基础模型或合并后的模型，并提供流式/非流式生成接口。
"""

import asyncio
import os
import shutil
import threading
from queue import Empty
from pathlib import Path
from typing import AsyncIterator, Iterator, Optional

import torch
from peft import PeftModel
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TextIteratorStreamer,
)


class LocalLLM:
    """封装本地微调模型的加载与推理。"""

    def __init__(
        self,
        model_path: str,
        base_model_path: Optional[str] = None,
        device: Optional[str] = None,
        load_in_8bit: bool = False,
    ):
        """
        参数
        ----
        model_path      合并后的完整模型路径（优先），或 LoRA adapter 路径
        base_model_path 若 model_path 是 LoRA adapter，则需提供基础模型路径
        device          "cuda" / "cpu" / "mps"，None 则自动检测
        load_in_8bit    是否启用 8-bit 量化推理（节省显存，速度略慢）
        """
        self.model_path = model_path
        self.base_model_path = base_model_path
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.load_in_8bit = load_in_8bit
        self._lock = threading.Lock()
        self._gen_error: Optional[Exception] = None

        print(f"[LocalLLM] 设备: {self.device}")
        self._load()

    def _load(self):
        """加载分词器和模型。"""
        def _prepare_offload_dir(suffix: str) -> Path:
            """创建并清空一次性 offload 目录，避免复用旧 index 导致键名不匹配。"""
            base = Path(os.getenv("BNB_OFFLOAD_DIR", ".bnb_offload"))
            target = base / f"{suffix}_{os.getpid()}"
            if target.exists():
                shutil.rmtree(target, ignore_errors=True)
            target.mkdir(parents=True, exist_ok=True)
            return target

        adapter_config = Path(self.model_path) / "adapter_config.json"
        is_lora_adapter = adapter_config.exists()

        if is_lora_adapter and not self.base_model_path:
            # 尝试从 adapter_config.json 读取 base_model_name_or_path
            import json
            with open(adapter_config) as f:
                ac = json.load(f)
            self.base_model_path = ac.get("base_model_name_or_path", "")
            print(f"[LocalLLM] 检测到 LoRA adapter，基础模型: {self.base_model_path}")

        load_path = self.base_model_path if is_lora_adapter else self.model_path

        print(f"[LocalLLM] 加载分词器: {load_path}")
        self.tokenizer = AutoTokenizer.from_pretrained(
            load_path,
            trust_remote_code=True,
            padding_side="left",
        )
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        print(f"[LocalLLM] 加载模型: {load_path}")

        offload_dir: Optional[Path] = None
        use_disk_offload = os.getenv("BNB_USE_DISK_OFFLOAD", "0") == "1"
        kwargs: dict = {
            "device_map": "auto" if self.device == "cuda" else self.device,
            "trust_remote_code": True,
        }
        if self.load_in_8bit and self.device == "cuda":
            from transformers import BitsAndBytesConfig

            kwargs["quantization_config"] = BitsAndBytesConfig(load_in_8bit=True)
            # 默认仅使用 GPU+CPU offload。Windows + 8bit + LoRA 在磁盘 offload 场景下
            # 可能触发 bitsandbytes/accelerate 的 SCB 兼容异常。
            if use_disk_offload:
                offload_dir = _prepare_offload_dir("base")
                kwargs["offload_folder"] = str(offload_dir)
        else:
            kwargs["torch_dtype"] = torch.bfloat16 if self.device == "cuda" else torch.float32

        try:
            model = AutoModelForCausalLM.from_pretrained(load_path, **kwargs)
        except ValueError as e:
            # 8-bit 下显存不足时，transformers 可能要求显式开启 CPU offload。
            if self.load_in_8bit and self.device == "cuda" and "llm_int8_enable_fp32_cpu_offload" in str(e):
                from transformers import BitsAndBytesConfig

                print("[LocalLLM] 显存不足，启用 int8 + FP32 CPU offload 重试加载")
                kwargs["quantization_config"] = BitsAndBytesConfig(
                    load_in_8bit=True,
                    llm_int8_enable_fp32_cpu_offload=True,
                )
                if use_disk_offload:
                    offload_dir = _prepare_offload_dir("base")
                    kwargs["offload_folder"] = str(offload_dir)

                # 给 auto device map 预留一点余量，减少 OOM 风险
                total_gib = max(1, int(torch.cuda.get_device_properties(0).total_memory // (1024 ** 3)))
                kwargs["max_memory"] = {
                    0: f"{max(1, total_gib - 1)}GiB",
                    "cpu": "64GiB",
                }

                model = AutoModelForCausalLM.from_pretrained(load_path, **kwargs)
            else:
                raise

        if is_lora_adapter:
            print(f"[LocalLLM] 加载 LoRA adapter: {self.model_path}")
            # PEFT 在存在 offload 的 device_map 下通常要求显式提供 offload_folder；
            # 但为避免 Windows + bnb 下二次重映射带来的 SCB 兼容问题，这里仅传
            # offload_folder，不额外传 device_map/offload_buffers。
            peft_kwargs = {}
            if use_disk_offload and offload_dir is not None:
                peft_kwargs["offload_folder"] = str(offload_dir)

            try:
                model = PeftModel.from_pretrained(model, self.model_path, **peft_kwargs)
            except ValueError as e:
                # 某些 8-bit + auto device_map 组合下，PEFT 会在 dispatch 时强制要求 offload_dir。
                # 这里按需补齐并重试，避免启动阶段直接失败。
                if self.load_in_8bit and self.device == "cuda" and "offload_dir" in str(e):
                    # 使用独立目录，避免与 base model 的 offload 索引互相污染。
                    offload_dir = _prepare_offload_dir("peft")
                    peft_kwargs["offload_folder"] = str(offload_dir)
                    peft_kwargs["offload_buffers"] = True
                    print("[LocalLLM] PEFT 要求 offload_dir，已自动启用 offload_folder 重试")
                    model = PeftModel.from_pretrained(model, self.model_path, **peft_kwargs)
                else:
                    raise

            if self.load_in_8bit and self.device == "cuda" and os.name == "nt":
                if use_disk_offload:
                    print("[LocalLLM] Windows + 8bit + LoRA：已启用磁盘 offload（兼容性风险更高）")
                else:
                    print("[LocalLLM] Windows + 8bit + LoRA：默认关闭磁盘 offload，仅使用 GPU+CPU offload")

            if self.load_in_8bit and self.device == "cuda":
                print("[LocalLLM] 8-bit 模式下跳过 merge_and_unload，避免额外内存峰值")
            else:
                model = model.merge_and_unload()

        model.eval()
        self.model = model
        print("[LocalLLM] 模型加载完成")

    def _build_messages(self, messages: list[dict]) -> str:
        """将 messages 转为模型输入字符串。"""
        return self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

    def _tokenize(self, text: str) -> dict:
        return self.tokenizer(text, return_tensors="pt").to(self.model.device)

    # ── 非流式生成 ────────────────────────────────────────────────────────────
    def generate(
        self,
        messages: list[dict],
        max_new_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> str:
        prompt = self._build_messages(messages)
        inputs = self._tokenize(prompt)
        input_len = inputs["input_ids"].shape[1]

        with self._lock, torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=temperature > 0,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )

        new_ids = output_ids[0][input_len:]
        return self.tokenizer.decode(new_ids, skip_special_tokens=True)

    # ── 同步流式生成（yield 字符串块） ───────────────────────────────────────
    def stream_generate(
        self,
        messages: list[dict],
        max_new_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> Iterator[str]:
        prompt = self._build_messages(messages)
        inputs = self._tokenize(prompt)

        streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True,
            timeout=1.0,
        )

        self._gen_error = None

        gen_kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=temperature > 0,
            pad_token_id=self.tokenizer.pad_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
        )

        thread = threading.Thread(target=self._generate_in_thread, args=(gen_kwargs,))
        thread.start()

        stream_iter = iter(streamer)

        # 生成线程存活时持续拉取 token；若线程异常退出，避免前端无限等待。
        while thread.is_alive():
            try:
                token = next(stream_iter)
                yield token
            except StopIteration:
                break
            except Empty:
                # timeout 到期但线程可能仍在生成，继续等待
                continue
            except Exception:
                # 其它临时异常：若线程已结束则跳出，由下方统一抛出根因
                if not thread.is_alive():
                    break

        # 尝试消费可能残留在队列中的 token
        while True:
            try:
                token = next(stream_iter)
                yield token
            except (StopIteration, Empty):
                break
            except Exception:
                break

        thread.join()

        if self._gen_error is not None:
            raise RuntimeError(f"本地模型生成失败: {self._gen_error}") from self._gen_error

    def _generate_in_thread(self, gen_kwargs: dict):
        try:
            with self._lock, torch.no_grad():
                self.model.generate(**gen_kwargs)
        except Exception as e:
            self._gen_error = e

    # ── 异步流式生成（用于 FastAPI async） ───────────────────────────────────
    async def astream_generate(
        self,
        messages: list[dict],
        max_new_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> AsyncIterator[str]:
        loop = asyncio.get_event_loop()
        queue: asyncio.Queue = asyncio.Queue()

        def _run():
            for token in self.stream_generate(messages, max_new_tokens, temperature, top_p):
                loop.call_soon_threadsafe(queue.put_nowait, token)
            loop.call_soon_threadsafe(queue.put_nowait, None)  # 结束信号

        thread = threading.Thread(target=_run)
        thread.start()

        while True:
            token = await queue.get()
            if token is None:
                break
            yield token

        thread.join()


# ── 单例模型实例（由 server.py 初始化） ──────────────────────────────────────
_llm_instance: Optional[LocalLLM] = None


def get_llm() -> LocalLLM:
    if _llm_instance is None:
        raise RuntimeError("模型尚未初始化，请先调用 init_llm()")
    return _llm_instance


def init_llm(
    model_path: str,
    base_model_path: Optional[str] = None,
    device: Optional[str] = None,
    load_in_8bit: bool = False,
) -> LocalLLM:
    global _llm_instance
    _llm_instance = LocalLLM(model_path, base_model_path, device, load_in_8bit)
    return _llm_instance
