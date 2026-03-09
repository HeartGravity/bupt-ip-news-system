/**
 * 从 MongoDB 导出新闻/法规数据，供后续 Python 训练脚本使用
 *
 * 用法:
 *   node ml/data/export_news.js
 *   node ml/data/export_news.js --limit 500
 *
 * 输出:
 *   ml/data/raw/news.jsonl   每行一条 JSON 记录
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// ── 解析命令行参数 ──────────────────────────────────────────
const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0; // 0 = 全量

// ── 输出目录 ────────────────────────────────────────────────
const OUTPUT_DIR = path.resolve(__dirname, "raw");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "news.jsonl");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── News Schema（仅需字段，无需完整 Model） ─────────────────
const NewsSchema = new mongoose.Schema(
  {
    title: String,
    summary: String,
    content: String,
    category: String,
    tags: [String],
    publishDate: Date,
  },
  { collection: "news" }
);

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bupt-ip-news";

  console.log(`连接数据库: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const News = mongoose.model("News", NewsSchema);

  let query = News.find({})
    .select("title summary content category tags publishDate")
    .sort({ publishDate: -1 })
    .lean();

  if (LIMIT > 0) query = query.limit(LIMIT);

  const docs = await query.exec();
  console.log(`共查询到 ${docs.length} 条新闻`);

  const stream = fs.createWriteStream(OUTPUT_FILE, { encoding: "utf8" });

  let count = 0;
  for (const doc of docs) {
    const record = {
      id: doc._id.toString(),
      title: doc.title || "",
      summary: doc.summary || "",
      content: stripHtml(doc.content || ""),
      category: doc.category || "",
      tags: doc.tags || [],
      publishDate: doc.publishDate
        ? new Date(doc.publishDate).toISOString().slice(0, 10)
        : "",
    };

    // 跳过内容太短的条目（少于 50 字）
    if (record.content.length < 50 && record.summary.length < 20) continue;

    stream.write(JSON.stringify(record, null, 0) + "\n");
    count++;
  }

  stream.end();
  console.log(`已写入 ${count} 条记录 → ${OUTPUT_FILE}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("导出失败:", err);
  process.exit(1);
});
