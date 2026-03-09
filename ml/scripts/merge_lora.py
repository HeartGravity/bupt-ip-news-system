"""
将 LoRA adapter 权重合并到基础模型，生成完整的独立模型。

合并后的模型可直接用于推理，无需再加载 adapter。

用法：
  python ml/scripts/merge_lora.py
  python ml/scripts/merge_lora.py --adapter ml/models/lora-adapter --output ml/models/merged
  python ml/scripts/merge_lora.py --adapter ml/models/lora-adapter --base Qwen/Qwen2.5-7B-Instruct
"""

import argparse
import json
import sys
from pathlib import Path

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# ── 路径配置 ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

DEFAULT_ADAPTER = PROJECT_ROOT / "ml" / "models" / "lora-adapter"
DEFAULT_OUTPUT = PROJECT_ROOT / "ml" / "models" / "merged"


def get_base_model_name(adapter_path: Path) -> str:
    """从 adapter_config.json 中读取基础模型名称。"""
    config_file = adapter_path / "adapter_config.json"
    if not config_file.exists():
        raise FileNotFoundError(f"未找到 adapter_config.json: {config_file}")
    with open(config_file, encoding="utf-8") as f:
        cfg = json.load(f)
    base = cfg.get("base_model_name_or_path", "")
    if not base:
        raise ValueError("adapter_config.json 中未找到 base_model_name_or_path")
    return base


def merge(adapter_path: Path, base_model: str, output_path: Path):
    print(f"基础模型  : {base_model}")
    print(f"LoRA adapter: {adapter_path}")
    print(f"合并输出  : {output_path}")

    print("\n加载分词器……")
    tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)

    print("加载基础模型……")
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.bfloat16,
        device_map="cpu",       # 合并时使用 CPU，避免显存限制
        trust_remote_code=True,
    )

    print("加载并合并 LoRA adapter……")
    model = PeftModel.from_pretrained(model, str(adapter_path))
    model = model.merge_and_unload()
    model.eval()

    output_path.mkdir(parents=True, exist_ok=True)

    print(f"保存合并模型 → {output_path}")
    model.save_pretrained(str(output_path), safe_serialization=True)
    tokenizer.save_pretrained(str(output_path))

    print("\n合并完成！")
    print(f"推理服务器启动命令：")
    print(f"  python ml/inference/server.py --model {output_path.relative_to(PROJECT_ROOT)}")


def main():
    parser = argparse.ArgumentParser(description="合并 LoRA adapter 到基础模型")
    parser.add_argument(
        "--adapter",
        default=str(DEFAULT_ADAPTER),
        help=f"LoRA adapter 路径 (默认: {DEFAULT_ADAPTER})",
    )
    parser.add_argument(
        "--base",
        default=None,
        help="基础模型路径或 HuggingFace ID（默认从 adapter_config.json 中读取）",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help=f"合并后模型保存路径 (默认: {DEFAULT_OUTPUT})",
    )
    args = parser.parse_args()

    adapter_path = Path(args.adapter)
    output_path = Path(args.output)

    if not adapter_path.exists():
        print(f"错误: adapter 路径不存在: {adapter_path}")
        sys.exit(1)

    base_model = args.base or get_base_model_name(adapter_path)
    merge(adapter_path, base_model, output_path)


if __name__ == "__main__":
    main()
