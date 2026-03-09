"""
基于 LoRA / QLoRA 对预训练模型进行微调，使其专注于知识产权领域问答。

支持的模型：
  - Qwen2.5-7B-Instruct（推荐，≥16GB 显存）
  - Qwen2.5-3B-Instruct（≥8GB 显存）
  - Qwen2.5-1.5B-Instruct（≥6GB 显存，精度略低）
  - ChatGLM3-6B（备选）

用法：
  python ml/training/train.py                          # 使用默认 config.yaml
  python ml/training/train.py --config ml/training/config.yaml
  python ml/training/train.py --model Qwen/Qwen2.5-3B-Instruct --epochs 2
"""

import argparse
import json
import os
import sys
from pathlib import Path

import yaml

# ── 确保项目根目录在 sys.path ───────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import torch
from datasets import Dataset
from peft import LoraConfig, TaskType, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from trl import SFTTrainer, DataCollatorForCompletionOnlyLM


# ── 配置加载 ────────────────────────────────────────────────────────────────
def load_config(config_path: str) -> dict:
    with open(config_path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    return cfg


# ── 数据加载 ─────────────────────────────────────────────────────────────────
def load_jsonl(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def format_chatml(sample: dict, tokenizer) -> str:
    """将 messages 列表转为 ChatML 格式字符串（适用于 Qwen2.5）"""
    return tokenizer.apply_chat_template(
        sample["messages"],
        tokenize=False,
        add_generation_prompt=False,
    )


# ── 模型与分词器加载 ──────────────────────────────────────────────────────────
def load_model_and_tokenizer(cfg: dict):
    model_name = cfg["model_name"]
    use_4bit = cfg.get("use_4bit", False)

    print(f"加载分词器: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        padding_side="right",
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    bnb_config = None
    if use_4bit:
        print("启用 4-bit 量化 (QLoRA)")
        compute_dtype = (
            torch.bfloat16
            if cfg.get("bnb_4bit_compute_dtype", "bfloat16") == "bfloat16"
            else torch.float16
        )
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=compute_dtype,
            bnb_4bit_use_double_quant=True,
        )

    print(f"加载模型: {model_name}")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.bfloat16 if not use_4bit else None,
    )

    if use_4bit:
        model = prepare_model_for_kbit_training(model)

    return model, tokenizer


# ── 添加 LoRA 适配器 ──────────────────────────────────────────────────────────
def apply_lora(model, cfg: dict):
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=cfg.get("lora_r", 16),
        lora_alpha=cfg.get("lora_alpha", 32),
        lora_dropout=cfg.get("lora_dropout", 0.05),
        target_modules=cfg.get(
            "lora_target_modules",
            ["q_proj", "k_proj", "v_proj", "o_proj"],
        ),
        bias="none",
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    return model


# ── 主训练函数 ────────────────────────────────────────────────────────────────
def train(cfg: dict):
    # 解析路径（相对于项目根目录）
    train_path = PROJECT_ROOT / cfg["train_file"]
    eval_path = PROJECT_ROOT / cfg["eval_file"]
    output_dir = PROJECT_ROOT / cfg["output_dir"]
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"训练集: {train_path}")
    print(f"验证集: {eval_path}")

    train_data = load_jsonl(str(train_path))
    eval_data = load_jsonl(str(eval_path))
    print(f"训练样本数: {len(train_data)}，验证样本数: {len(eval_data)}")

    model, tokenizer = load_model_and_tokenizer(cfg)
    model = apply_lora(model, cfg)

    # 将数据格式化为文本
    def format_sample(sample):
        return {"text": format_chatml(sample, tokenizer)}

    train_dataset = Dataset.from_list(train_data).map(format_sample)
    eval_dataset = Dataset.from_list(eval_data).map(format_sample)

    training_args = TrainingArguments(
        output_dir=str(output_dir),
        num_train_epochs=cfg.get("num_train_epochs", 3),
        per_device_train_batch_size=cfg.get("per_device_train_batch_size", 2),
        per_device_eval_batch_size=cfg.get("per_device_eval_batch_size", 2),
        gradient_accumulation_steps=cfg.get("gradient_accumulation_steps", 8),
        learning_rate=cfg.get("learning_rate", 2e-4),
        lr_scheduler_type=cfg.get("lr_scheduler_type", "cosine"),
        warmup_ratio=cfg.get("warmup_ratio", 0.05),
        weight_decay=cfg.get("weight_decay", 0.01),
        logging_steps=cfg.get("logging_steps", 20),
        eval_strategy="steps",
        eval_steps=cfg.get("eval_steps", 100),
        save_strategy="steps",
        save_steps=cfg.get("save_steps", 200),
        save_total_limit=cfg.get("save_total_limit", 3),
        load_best_model_at_end=cfg.get("load_best_model_at_end", True),
        metric_for_best_model=cfg.get("metric_for_best_model", "eval_loss"),
        fp16=cfg.get("fp16", False),
        bf16=cfg.get("bf16", True),
        dataloader_num_workers=cfg.get("dataloader_num_workers", 0),
        report_to=cfg.get("report_to", "none"),
        remove_unused_columns=True,
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        dataset_text_field="text",
        max_seq_length=cfg.get("max_seq_length", 2048),
        packing=False,
    )

    print("\n开始训练……")
    trainer.train()

    print(f"\n保存 LoRA adapter → {output_dir}")
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    print("训练完成！")

    print("\n提示: 使用以下命令合并 LoRA 权重到基础模型：")
    print("  python ml/scripts/merge_lora.py")


# ── CLI ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="知识产权助手 LoRA 微调")
    parser.add_argument(
        "--config",
        default=str(Path(__file__).parent / "config.yaml"),
        help="训练配置文件路径",
    )
    parser.add_argument("--model", help="覆盖 config.yaml 中的 model_name")
    parser.add_argument("--epochs", type=int, help="覆盖训练轮数")
    parser.add_argument("--output-dir", help="覆盖输出目录")
    args = parser.parse_args()

    cfg = load_config(args.config)

    if args.model:
        cfg["model_name"] = args.model
    if args.epochs:
        cfg["num_train_epochs"] = args.epochs
    if args.output_dir:
        cfg["output_dir"] = args.output_dir

    train(cfg)


if __name__ == "__main__":
    main()
