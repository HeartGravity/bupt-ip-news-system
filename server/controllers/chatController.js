const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const ChatHistory = require("../models/ChatHistory");
const { retrieveContext, extractKeywords } = require("../utils/ragService");

const HUNYUAN_API_URL =
  "https://api.hunyuan.cloud.tencent.com/v1/chat/completions";
const HUNYUAN_MODEL = "hunyuan-turbo";

// ── 本地 LLM 配置 ────────────────────────────────────────────────────────────
// 当设置了 LOCAL_LLM_URL 时，优先使用本地微调模型；否则回退到 Hunyuan API
function getLLMConfig() {
  const localUrl = process.env.LOCAL_LLM_URL; // 例如 http://localhost:8000
  if (localUrl) {
    return {
      url: `${localUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: process.env.LOCAL_LLM_MODEL || "local-finetuned",
      headers: { "Content-Type": "application/json" },
      isLocal: true,
    };
  }
  return {
    url: HUNYUAN_API_URL,
    model: HUNYUAN_MODEL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HUNYUAN_API_KEY}`,
    },
    isLocal: false,
  };
}

// 检查当前 AI 服务是否可用（本地模型 或 配置了 Hunyuan key）
function isAIAvailable() {
  return !!(process.env.LOCAL_LLM_URL || process.env.HUNYUAN_API_KEY);
}

const BASE_SYSTEM_PROMPT = `你是北京邮电大学知识产权服务中心的AI智能助手。你的职责是：
1. 解答用户关于专利、商标、著作权等知识产权相关的问题
2. 提供知识产权申请流程指导
3. 解释知识产权相关法律法规
4. 提供知识产权保护建议

回答规范：
- 如果下方提供了【参考资料】，请优先基于这些站内资料回答，并在合适位置说明"根据本站相关资料"
- 如果参考资料不足以回答问题，可结合通用知识补充回答
- 使用 Markdown 格式组织回答（标题、列表、加粗等），使内容清晰易读
- 请用专业但通俗易懂的中文回答
- 如果问题完全超出知识产权范围，礼貌引导用户回到相关话题`;

// 粗略计算字符串是否相似，用于判断是否复用 RAG 缓存
function isSameTopic(query1, query2) {
  if (!query1 || !query2) return false;
  // 简单用关键字提取来看看是否匹配（在实际生产中可能用 embedding 更好，这里用近似判断）
  const kw1 = new Set(query1.split(" "));
  const kw2 = new Set(query2.split(" "));
  const intersection = new Set([...kw1].filter((x) => kw2.has(x)));
  // 如果重合度大于等于1个词即可视为同一话题缓存
  return intersection.size >= 1;
}

// 异步生成对话摘要，不阻塞主线程
async function generateSummaryAsync(chatId, contextMessages) {
  try {
    const prompt = [
      ...contextMessages,
      {
        role: "user",
        content: "请用一段简练的话总结我们到目前为止的对话主题和核心结论。",
      },
    ];

    const llm = getLLMConfig();
    const response = await fetch(llm.url, {
      method: "POST",
      headers: llm.headers,
      body: JSON.stringify({
        model: llm.model,
        messages: prompt,
        stream: false,
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content;
      if (summary) {
        await ChatHistory.findByIdAndUpdate(chatId, { summary });
        console.log(`对话[${chatId}]摘要已生成:`, summary);
      }
    }
  } catch (error) {
    console.error("生成摘要失败:", error);
  }
}

// 构建注入了 RAG 上下文的 system prompt
function buildSystemPrompt(ragContext, summary = "") {
  let prompt = BASE_SYSTEM_PROMPT;
  if (summary) {
    prompt += `\n\n--- 之前对话的摘要总结：\n${summary}`;
  }
  if (ragContext) {
    prompt += `\n\n--- 以下是站内检索到的相关资料，请参考：\n\n${ragContext}`;
  }
  prompt += `\n---`;
  return prompt;
}

// 调用 LLM 流式 API（兼容本地模型与 Hunyuan）
async function callLLMStream(contextMessages, res) {
  const llm = getLLMConfig();
  const response = await fetch(llm.url, {
    method: "POST",
    headers: llm.headers,
    body: JSON.stringify({
      model: llm.model,
      messages: contextMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const provider = llm.isLocal ? "本地 LLM" : "Hunyuan API";
    console.error(`${provider} 错误:`, response.status, errorText);
    throw new Error(`${provider} 返回 ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullReply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullReply += delta;
          res.write(
            `data: ${JSON.stringify({ type: "chunk", content: delta })}\n\n`,
          );
        }
      } catch (e) {
        // 忽略解析失败的行
      }
    }
  }

  return fullReply;
}

// @desc    流式发送消息给AI智能体 (SSE + RAG)
// @route   POST /api/chat/stream
// @access  Private
exports.streamMessage = asyncHandler(async (req, res, next) => {
  const { message, chatId } = req.body;

  if (!message || !message.trim()) {
    return next(new ErrorResponse("消息内容不能为空", 400));
  }

  if (!isAIAvailable()) {
    return next(new ErrorResponse("AI 服务未配置，请联系管理员", 500));
  }

  let chat;
  if (chatId) {
    chat = await ChatHistory.findOne({ _id: chatId, user: req.user.id });
    if (!chat) return next(new ErrorResponse("对话不存在", 404));
  } else {
    chat = await ChatHistory.create({
      user: req.user.id,
      title:
        message.trim().substring(0, 20) + (message.length > 20 ? "..." : ""),
      messages: [],
    });
  }

  const currentMsg = message.trim();
  chat.messages.push({ role: "user", content: currentMsg });

  // 1. 判断是否使用 RAG 缓存
  let ragContext = "";
  const keywords = extractKeywords(currentMsg); // 这需要你在 ragService 中导出 extractKeywords 方法

  if (chat.ragCache && chat.ragCache.context && chat.ragCache.timestamp) {
    // 判断缓存时间是否在N轮内（比如这里以时间代替：是否在10分钟以内）
    const timeDiff = Date.now() - chat.ragCache.timestamp.getTime();
    if (
      timeDiff < 10 * 60 * 1000 &&
      isSameTopic(chat.ragCache.query, keywords)
    ) {
      ragContext = chat.ragCache.context;
      // 触发表明显复用
      console.log("复用 RAG 缓存上下文");
    }
  }

  // 2. 如果未命中缓存，则重新查询
  if (!ragContext && keywords) {
    ragContext = await retrieveContext(currentMsg);
    if (ragContext) {
      chat.ragCache = {
        query: keywords,
        context: ragContext,
        timestamp: Date.now(),
      };
    }
  }

  // 3. 上下文截断与 Token 管理
  // 近期消息只保留最后 6 轮（12条 message），防止超出 Token 限制
  const MAX_HISTORY = 12;
  const recentMessages = chat.messages
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content }));

  // 构建消息列表
  const contextMessages = [
    { role: "system", content: buildSystemPrompt(ragContext, chat.summary) },
    ...recentMessages,
  ];

  // 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // 通知前端对话ID和标题
  res.write(
    `data: ${JSON.stringify({ type: "start", chatId: chat._id, title: chat.title, hasRag: !!ragContext })}\n\n`,
  );

  let fullReply = "";

  try {
    fullReply = await callLLMStream(contextMessages, res);

    if (fullReply) {
      chat.messages.push({ role: "assistant", content: fullReply });
      await chat.save();

      if (chat.messages.length >= 20 && !chat.summary) {
        generateSummaryAsync(chat._id, contextMessages);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error("流式请求失败:", err);
    res.write(
      `data: ${JSON.stringify({ type: "error", content: "AI 服务暂时不可用，请稍后再试" })}\n\n`,
    );
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    await chat.save();
  }
});

// @desc    非流式发送消息（备用）
// @route   POST /api/chat/send
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message, chatId } = req.body;

  if (!message || !message.trim()) {
    return next(new ErrorResponse("消息内容不能为空", 400));
  }

  let chat;
  if (chatId) {
    chat = await ChatHistory.findOne({ _id: chatId, user: req.user.id });
    if (!chat) return next(new ErrorResponse("对话不存在", 404));
  } else {
    chat = await ChatHistory.create({
      user: req.user.id,
      title:
        message.trim().substring(0, 20) + (message.length > 20 ? "..." : ""),
      messages: [],
    });
  }

  chat.messages.push({ role: "user", content: message.trim() });

  let aiReply = "AI 服务未配置，请联系管理员。";

  if (isAIAvailable()) {
    const ragContext = await retrieveContext(message.trim());
    const contextMessages = [
      { role: "system", content: buildSystemPrompt(ragContext) },
      ...chat.messages
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    const llm = getLLMConfig();
    try {
      const response = await fetch(llm.url, {
        method: "POST",
        headers: llm.headers,
        body: JSON.stringify({
          model: llm.model,
          messages: contextMessages,
          stream: false,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) throw new Error(`API 返回 ${response.status}`);

      const data = await response.json();
      aiReply = data.choices?.[0]?.message?.content || "抱歉，未能获取到回复。";
    } catch (err) {
      const provider = llm.isLocal ? "本地 LLM" : "Hunyuan API";
      console.error(`${provider} 调用失败:`, err);
      aiReply = "抱歉，AI 服务暂时不可用，请稍后再试。";
    }
  }

  chat.messages.push({ role: "assistant", content: aiReply });
  await chat.save();

  res.status(200).json({
    success: true,
    data: { chatId: chat._id, reply: aiReply, title: chat.title },
  });
});

// @desc    获取用户所有对话列表
// @route   GET /api/chat/history
// @access  Private
exports.getChatList = asyncHandler(async (req, res, next) => {
  const chats = await ChatHistory.find({ user: req.user.id })
    .select("title createdAt updatedAt")
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, count: chats.length, data: chats });
});

// @desc    获取单个对话的完整消息
// @route   GET /api/chat/history/:chatId
// @access  Private
exports.getChatDetail = asyncHandler(async (req, res, next) => {
  const chat = await ChatHistory.findOne({
    _id: req.params.chatId,
    user: req.user.id,
  });
  if (!chat) return next(new ErrorResponse("对话不存在", 404));
  res.status(200).json({ success: true, data: chat });
});

// @desc    删除对话
// @route   DELETE /api/chat/history/:chatId
// @access  Private
exports.deleteChat = asyncHandler(async (req, res, next) => {
  const chat = await ChatHistory.findOneAndDelete({
    _id: req.params.chatId,
    user: req.user.id,
  });
  if (!chat) return next(new ErrorResponse("对话不存在", 404));
  res.status(200).json({ success: true, message: "对话已删除" });
});
