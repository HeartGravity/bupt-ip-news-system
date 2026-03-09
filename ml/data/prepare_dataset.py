"""
将原始数据转换为 Qwen2.5 / ChatGLM 微调所需的 ChatML 格式数据集。

支持两类数据源：
  1. ml/data/raw/news.jsonl      - 由 export_news.js 导出的新闻条目
  2. ml/data/laws/*.txt          - 手动放入的法律法规纯文本文件

输出：
  ml/data/train.jsonl            - 训练集（90%）
  ml/data/eval.jsonl             - 验证集（10%）

每条样本格式（messages list）：
  [
    {"role": "system",    "content": "..."},
    {"role": "user",      "content": "..."},
    {"role": "assistant", "content": "..."}
  ]

用法：
  python ml/data/prepare_dataset.py
  python ml/data/prepare_dataset.py --news-only
  python ml/data/prepare_dataset.py --laws-only
"""

import json
import os
import random
import re
import argparse
from pathlib import Path

# ── 路径配置 ────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent
RAW_NEWS_FILE = ROOT / "raw" / "news.jsonl"
LAWS_DIR = ROOT / "laws"
TRAIN_FILE = ROOT / "train.jsonl"
EVAL_FILE = ROOT / "eval.jsonl"

SYSTEM_PROMPT = (
    "你是北京邮电大学知识产权服务中心的AI智能助手。"
    "你的职责是解答专利、商标、著作权等知识产权相关问题，"
    "提供申请流程指导，解释相关法律法规，并给出保护建议。"
    "请用专业、准确、通俗易懂的中文回答，并在适当时使用 Markdown 格式。"
)

# ── 新闻问题模板 ──────────────────────────────────────────────────────────
NEWS_QA_TEMPLATES = [
    ("{title}的主要内容是什么？", "{summary}\n\n{content}"),
    ("请介绍一下"{title}"", "{summary}\n\n{content}"),
    ("{category}领域有什么最新动态？", "根据最新资讯，{title}。\n\n{content}"),
    ("关于{title}，有哪些值得关注的信息？", "{content}"),
    ("请总结{title}的核心要点。", "{summary}"),
]

# ── 法规问题模板 ──────────────────────────────────────────────────────────
LAW_QA_TEMPLATES = [
    ("{law_name}的主要规定是什么？", "{content}"),
    ("请介绍{law_name}的核心条款。", "{content}"),
    ("{law_name}对知识产权保护有哪些要求？", "{content}"),
    ("根据{law_name}，相关当事人的权利和义务是什么？", "{content}"),
]


def clean_text(text: str, max_len: int = 800) -> str:
    """清理文本，去除多余空白，截断到 max_len 字"""
    text = re.sub(r"\s+", " ", text.strip())
    return text[:max_len] + "……" if len(text) > max_len else text


def make_sample(user_msg: str, assistant_msg: str) -> dict:
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg.strip()},
            {"role": "assistant", "content": assistant_msg.strip()},
        ]
    }


# ── 从新闻数据生成样本 ────────────────────────────────────────────────────
def samples_from_news(path: Path) -> list[dict]:
    if not path.exists():
        print(f"[警告] 未找到新闻数据文件: {path}")
        return []

    samples = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                doc = json.loads(line)
            except json.JSONDecodeError:
                continue

            title = doc.get("title", "").strip()
            summary = clean_text(doc.get("summary", ""), 300)
            content = clean_text(doc.get("content", ""), 600)
            category = doc.get("category", "知识产权")

            if not title or (not summary and not content):
                continue

            # 为每条新闻随机选 1-2 个问答模板
            chosen = random.sample(NEWS_QA_TEMPLATES, min(2, len(NEWS_QA_TEMPLATES)))
            for q_tpl, a_tpl in chosen:
                answer_text = a_tpl.format(
                    title=title, summary=summary, content=content, category=category
                ).strip()
                if len(answer_text) < 30:
                    continue
                question = q_tpl.format(
                    title=title, summary=summary, content=content, category=category
                )
                samples.append(make_sample(question, answer_text))

    print(f"[新闻] 生成 {len(samples)} 条样本（来源: {path}）")
    return samples


# ── 从法规 TXT 文件生成样本 ───────────────────────────────────────────────
def samples_from_laws(laws_dir: Path) -> list[dict]:
    if not laws_dir.exists():
        return []

    samples = []
    txt_files = list(laws_dir.glob("*.txt"))
    if not txt_files:
        print(f"[提示] {laws_dir} 中没有 .txt 法规文件，跳过法规数据生成。")
        return []

    for txt_path in txt_files:
        law_name = txt_path.stem  # 文件名作为法规名称
        raw = txt_path.read_text(encoding="utf-8", errors="ignore")

        # 按条（第X条）分割，每条单独生成问答
        articles = re.split(r"(第[零一二三四五六七八九十百]+条)", raw)

        # 重新组合"第X条 内容"
        chunks = []
        i = 1
        while i < len(articles) - 1:
            art_num = articles[i].strip()
            art_body = articles[i + 1].strip() if i + 1 < len(articles) else ""
            if art_body:
                chunks.append(f"{art_num} {art_body}")
            i += 2

        # 若分割失败，则按段落分割
        if not chunks:
            chunks = [p.strip() for p in re.split(r"\n{2,}", raw) if len(p.strip()) > 50]

        # 对每个块生成样本（每块随机选一个模板）
        for chunk in chunks[:100]:  # 每个法规最多取前100条
            content = clean_text(chunk, 600)
            if len(content) < 30:
                continue
            tpl = random.choice(LAW_QA_TEMPLATES)
            q = tpl[0].format(law_name=law_name, content=content)
            a = tpl[1].format(law_name=law_name, content=content)
            samples.append(make_sample(q, a))

        # 额外生成一条"整体介绍"样本
        overview = clean_text(raw[:1000], 800)
        if overview:
            samples.append(
                make_sample(
                    f"请简要介绍{law_name}的主要内容。",
                    overview,
                )
            )

    print(f"[法规] 生成 {len(samples)} 条样本（来源: {len(txt_files)} 个文件）")
    return samples


# ── 写入 JSONL ────────────────────────────────────────────────────────────
def write_jsonl(samples: list[dict], path: Path):
    with open(path, "w", encoding="utf-8") as f:
        for s in samples:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")
    print(f"已写入 {len(samples)} 条 → {path}")


# ── 主流程 ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--news-only", action="store_true", help="仅使用新闻数据")
    parser.add_argument("--laws-only", action="store_true", help="仅使用法规数据")
    parser.add_argument("--eval-ratio", type=float, default=0.1, help="验证集比例 (默认 0.1)")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    all_samples: list[dict] = []

    if not args.laws_only:
        all_samples += samples_from_news(RAW_NEWS_FILE)

    if not args.news_only:
        all_samples += samples_from_laws(LAWS_DIR)

    if not all_samples:
        print("没有生成任何训练样本，请检查数据源。")
        return

    random.shuffle(all_samples)

    split = max(1, int(len(all_samples) * (1 - args.eval_ratio)))
    train_samples = all_samples[:split]
    eval_samples = all_samples[split:]

    write_jsonl(train_samples, TRAIN_FILE)
    write_jsonl(eval_samples, EVAL_FILE)
    print(f"\n完成: 训练集 {len(train_samples)} 条，验证集 {len(eval_samples)} 条")


if __name__ == "__main__":
    main()
