const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ChatHistory = require("../models/ChatHistory");

// @desc    获取 AI 统计信息 (后台看板使用)
// @route   GET /api/admin/analytics/ai
// @access  Private/Admin
exports.getAiAnalytics = asyncHandler(async (req, res, next) => {
  // 1. 最近7天对话活跃数量曲线
  const aggChatDaily = await ChatHistory.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 7 },
  ]);

  // 2. AI 回复质量监控 (查询被打低分差评的记录，供后期复盘人工核对)
  const qualityIssues = await ChatHistory.aggregate([
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant", "messages.rating": -1 } },
    { $sort: { "messages.timestamp": -1 } },
    { $limit: 20 },
    {
      $project: {
        chatId: "$_id",
        messageContent: "$messages.content",
        feedback: "$messages.feedback",
        timestamp: "$messages.timestamp",
      },
    },
  ]);

  // 3. 热门问题分析: 提取所有的 User RAG 检索词作为近期热门讨论
  const recentTopics = await ChatHistory.find({
    "ragCache.query": { $exists: true },
  })
    .select("ragCache.query")
    .sort({ updatedAt: -1 })
    .limit(100);

  // 对最近100通对话进行简易热词统计
  const wordCount = {};
  recentTopics.forEach((doc) => {
    if (doc.ragCache && doc.ragCache.query) {
      const words = doc.ragCache.query.split(/\s+/);
      words.forEach((w) => {
        if (w.trim() && w.length >= 2) {
          // 过滤掉单字无意义词组
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
      });
    }
  });

  // 转为数组，倒序排列并取前 10 成为热榜
  const hotKeywords = Object.keys(wordCount)
    .map((key) => ({ word: key, count: wordCount[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. 总统计数据看板数据
  const totalChats = await ChatHistory.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalChats,
      dailyChats: aggChatDaily,
      hotKeywords,
      qualityIssues,
    },
  });
});
