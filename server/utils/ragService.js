/**
 * RAG 检索服务
 * 同时检索 LawDoc（法律条文）和 News（新闻），法律条文优先。
 * 新闻/法律入库时 MongoDB 自动更新索引，无需手动维护。
 */

const News = require("../models/News");
const LawDoc = require("../models/LawDoc");

// 从用户问题中提取关键词（去掉疑问词等噪音）
function extractKeywords(text) {
  const stopWords = new Set([
    "什么", "怎么", "如何", "为什么", "是否", "可以", "请问",
    "介绍", "说明", "解释", "告诉", "帮我", "我想", "知道",
    "的", "了", "吗", "呢", "吧", "啊", "嗯", "哦",
    "一个", "这个", "那个", "哪个", "哪些",
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
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 检索相关法律条文和新闻，返回格式化上下文字符串
 * @param {string} question
 * @param {number} topK
 * @returns {string}
 */
async function retrieveContext(question, topK = 3) {
  try {
    const keywords = extractKeywords(question);
    if (!keywords) return "";

    // 1. 法律条文检索
    let lawDocs = await LawDoc.find(
      { $text: { $search: keywords } },
      { score: { $meta: "textScore" }, title: 1, content: 1 },
    ).sort({ score: { $meta: "textScore" } }).limit(topK).lean();

    // 2. 新闻检索
    let newsDocs = await News.find(
      { $text: { $search: keywords } },
      { score: { $meta: "textScore" }, title: 1, summary: 1, content: 1, category: 1, publishDate: 1 },
    ).sort({ score: { $meta: "textScore" } }).limit(topK).lean();

    // 新闻全文无结果时模糊回退
    if (newsDocs.length === 0) {
      const regexParts = keywords.split(" ").filter(Boolean).map((k) => `(?=.*${k})`).join("");
      const regex = new RegExp(regexParts, "i");
      newsDocs = await News.find({ $or: [{ title: regex }, { summary: regex }, { category: regex }] })
        .select("title summary content category publishDate")
        .sort({ publishDate: -1 }).limit(topK).lean();
    }

    // 格式化法律条文片段
    const lawSnippets = lawDocs.map((doc, i) => {
      const excerpt = doc.content.length > 400 ? doc.content.slice(0, 400) + "……" : doc.content;
      return `【法律条文${i + 1}】\n来源：${doc.title}\n内容：${excerpt}`;
    });

    // 格式化新闻片段
    const newsSnippets = newsDocs.map((doc, i) => {
      const plainContent = stripHtml(doc.content || "");
      const excerpt = plainContent.length > 400 ? plainContent.slice(0, 400) + "……" : plainContent;
      const date = doc.publishDate ? new Date(doc.publishDate).toLocaleDateString("zh-CN") : "";
      return `【新闻资料${i + 1}】\n标题：${doc.title}\n分类：${doc.category}${date ? `  日期：${date}` : ""}\n摘要：${doc.summary || ""}\n内容节选：${excerpt}`;
    });

    const all = [...lawSnippets, ...newsSnippets];
    if (all.length === 0) return "";
    return all.join("\n\n");
  } catch (err) {
    console.error("RAG 检索失败:", err);
    return "";
  }
}

module.exports = { retrieveContext, extractKeywords };
