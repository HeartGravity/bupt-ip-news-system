const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const ChatHistory = require("../models/ChatHistory");
const { retrieveContext, extractKeywords } = require("../utils/ragService");

const HUNYUAN_API_URL =
  "https://api.hunyuan.cloud.tencent.com/v1/chat/completions";
const HUNYUAN_MODEL = "hunyuan-turbo";

// ── 本地 LLM 配置 ────────────────────────────────────────────────────────────
// 支持本地模型 + Hunyuan 双通道：
// - 命中站内资料时优先本地
// - 未命中时优先 Hunyuan
// - 首选失败时自动回退到另一路
function getProviderConfigs() {
  const providers = [];

  const localUrl = process.env.LOCAL_LLM_URL; // 例如 http://localhost:8000
  if (localUrl) {
    providers.push({
      url: `${localUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: process.env.LOCAL_LLM_MODEL || "local-finetuned",
      headers: { "Content-Type": "application/json" },
      isLocal: true,
      name: "本地 LLM",
    });
  }

  if (process.env.HUNYUAN_API_KEY) {
    providers.push({
      url: HUNYUAN_API_URL,
      model: HUNYUAN_MODEL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUNYUAN_API_KEY}`,
      },
      isLocal: false,
      name: "Hunyuan API",
    });
  }

  return providers;
}

function getProviderOrder({ preferLocal = true } = {}) {
  const providers = getProviderConfigs();
  if (providers.length <= 1) return providers;

  const local = providers.find((p) => p.isLocal);
  const remote = providers.find((p) => !p.isLocal);

  if (!local || !remote) return providers;
  return preferLocal ? [local, remote] : [remote, local];
}

// 检查当前 AI 服务是否可用（本地模型 或 配置了 Hunyuan key）
function isAIAvailable() {
  return getProviderConfigs().length > 0;
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

    const data = await callLLMNonStream(prompt, {
      preferLocal: true,
      temperature: 0.5,
      maxTokens: 300,
    });
    if (data) {
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
async function callLLMStream(
  contextMessages,
  res,
  { preferLocal = true, onProviderSelected = null } = {},
) {
  const providers = getProviderOrder({ preferLocal });
  if (providers.length === 0) {
    throw new Error("AI 服务未配置");
  }

  let lastError = null;
  // 本地 7B + 8bit + offload 首 token 可能较慢，默认放宽到 5 分钟。
  // 该超时为“空闲超时”：每次收到上游字节后都会重置。
  const timeoutMs = Number(process.env.LLM_STREAM_TIMEOUT_MS || 300000);

  for (const llm of providers) {
    const controller = new AbortController();
    let timer;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), timeoutMs);
    };

    resetTimer();
    try {
      const response = await fetch(llm.url, {
        method: "POST",
        headers: llm.headers,
        signal: controller.signal,
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
        throw new Error(`${llm.name} 返回 ${response.status}: ${errorText}`);
      }

      onProviderSelected?.(llm);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetTimer();

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
            if (parsed?.error?.message) {
              throw new Error(`${llm.name} 返回错误: ${parsed.error.message}`);
            }
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

      return { fullReply, provider: llm.isLocal ? "local" : "hunyuan" };
    } catch (err) {
      if (err?.name === "AbortError") {
        lastError = new Error(
          `${llm.name} 流式响应空闲超时（>${timeoutMs}ms）`,
        );
      } else {
        lastError = err;
      }
      console.error(`${llm.name} 调用失败，尝试回退:`, err.message || err);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  throw lastError || new Error("所有 AI 服务均不可用");
}

async function callLLMNonStream(
  contextMessages,
  { preferLocal = true, temperature = 0.7, maxTokens = 2048 } = {},
) {
  const providers = getProviderOrder({ preferLocal });
  if (providers.length === 0) {
    throw new Error("AI 服务未配置");
  }

  let lastError = null;
  const timeoutMs = Number(process.env.LLM_NONSTREAM_TIMEOUT_MS || 120000);
  for (const llm of providers) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(llm.url, {
        method: "POST",
        headers: llm.headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: llm.model,
          messages: contextMessages,
          stream: false,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${llm.name} 返回 ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        data,
        provider: llm.isLocal ? "local" : "hunyuan",
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        lastError = new Error(`${llm.name} 非流式响应超时（>${timeoutMs}ms）`);
      } else {
        lastError = err;
      }
      console.error(`${llm.name} 调用失败，尝试回退:`, err.message || err);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error("所有 AI 服务均不可用");
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

  console.log("[chat/stream] RAG 检索结果:", {
    keywords,
    ragHit: !!ragContext,
    question: currentMsg,
  });

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

  // 命中站内资料时优先本地；未命中时优先 Hunyuan（可联网能力更强）
  const preferLocal = !!ragContext;
  console.log(
    "[chat/stream] Provider 优先级:",
    preferLocal ? "local -> hunyuan" : "hunyuan -> local",
  );

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
  let provider = null;

  try {
    const result = await callLLMStream(contextMessages, res, {
      preferLocal,
      onProviderSelected: (selectedProvider) => {
        provider = selectedProvider.isLocal ? "local" : "hunyuan";
        console.log("[chat/stream] 实际选择 Provider:", provider);
        res.write(
          `data: ${JSON.stringify({ type: "provider", provider, providerLabel: selectedProvider.name })}\n\n`,
        );
      },
    });
    fullReply = result.fullReply;

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

    const preferLocal = !!ragContext;

    try {
      const result = await callLLMNonStream(contextMessages, { preferLocal });
      aiReply =
        result.data.choices?.[0]?.message?.content || "抱歉，未能获取到回复。";
      chat.$locals = {
        ...(chat.$locals || {}),
        provider: result.provider,
      };
    } catch (err) {
      console.error("LLM 调用失败:", err);
      aiReply = "抱歉，AI 服务暂时不可用，请稍后再试。";
    }
  }

  chat.messages.push({ role: "assistant", content: aiReply });
  await chat.save();

  res.status(200).json({
    success: true,
    data: {
      chatId: chat._id,
      reply: aiReply,
      title: chat.title,
      provider: chat.$locals?.provider || null,
    },
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
