/**
 * RAG 检索服务
 * 利用 MongoDB 全文索引对站内新闻进行语义检索，
 * 将相关片段注入 System Prompt，引导 AI 基于站内数据回答。
 * 新闻入库时 MongoDB 自动更新索引，无需手动维护。
 */

const News = require("../models/News");

// 从用户问题中提取关键词（去掉疑问词等噪音）
function extractKeywords(text) {
  const stopWords = new Set([
    "什么",
    "怎么",
    "如何",
    "为什么",
    "是否",
    "可以",
    "请问",
    "介绍",
    "说明",
    "解释",
    "告诉",
    "帮我",
    "我想",
    "知道",
    "的",
    "了",
    "吗",
    "呢",
    "吧",
    "啊",
    "嗯",
    "哦",
    "一个",
    "这个",
    "那个",
    "哪个",
    "哪些",
  ]);
  return text
    .replace(/[？?！!，,。.、；;：:""''【】（）()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w))
    .slice(0, 6)
    .join(" ");
}

// 纯文本截取（去掉 HTML 标签）
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 检索与问题相关的站内新闻，返回格式化的上下文字符串
 * @param {string} question - 用户问题
 * @param {number} topK      - 最多返回条数
 * @returns {string} 格式化后的 RAG 上下文（空字符串表示无相关内容）
 */
async function retrieveContext(question, topK = 4) {
  try {
    const keywords = extractKeywords(question);
    if (!keywords) return "";

    // 优先用全文索引检索
    let docs = await News.find(
      { $text: { $search: keywords } },
      {
        score: { $meta: "textScore" },
        title: 1,
        summary: 1,
        content: 1,
        category: 1,
        publishDate: 1,
      },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(topK)
      .lean();

    // 若全文检索无结果，回退到 category/title 模糊匹配
    if (docs.length === 0) {
      const regexParts = keywords
        .split(" ")
        .filter(Boolean)
        .map((k) => `(?=.*${k})`)
        .join("");
      const regex = new RegExp(regexParts, "i");
      docs = await News.find({
        $or: [{ title: regex }, { summary: regex }, { category: regex }],
      })
        .select("title summary content category publishDate")
        .sort({ publishDate: -1 })
        .limit(topK)
        .lean();
    }

    if (docs.length === 0) return "";

    // 格式化为 AI 可理解的上下文段落
    const snippets = docs.map((doc, i) => {
      const plainContent = stripHtml(doc.content || "");
      // 截取前 400 字，避免 token 过多
      const excerpt =
        plainContent.length > 400
          ? plainContent.slice(0, 400) + "……"
          : plainContent;
      const date = doc.publishDate
        ? new Date(doc.publishDate).toLocaleDateString("zh-CN")
        : "";

      return `【参考资料${i + 1}】
标题：${doc.title}
分类：${doc.category}${date ? `  日期：${date}` : ""}
摘要：${doc.summary || ""}
内容节选：${excerpt}`;
    });

    return snippets.join("\n\n");
  } catch (err) {
    console.error("RAG 检索失败:", err);
    return "";
  }
}

module.exports = { retrieveContext, extractKeywords };
