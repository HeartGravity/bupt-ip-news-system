import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "/api";

// 智能体聊天相关API
export const chatApi = {
  // 流式发送消息（SSE）
  streamMessage: async (
    message,
    chatId,
    onChunk,
    onStart,
    onError,
    onDone,
    onProvider,
    abortSignal,
  ) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      signal: abortSignal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, chatId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败 (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let doneReceived = false;

    const handleSSELine = (line) => {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) return;

      const data = trimmed.slice(6);
      if (data === "[DONE]") {
        doneReceived = true;
        onDone?.();
        return;
      }

      try {
        const parsed = JSON.parse(data);

        switch (parsed.type) {
          case "start":
            onStart?.(parsed.chatId, parsed.title, {
              hasRag: parsed.hasRag,
              provider: parsed.provider || null,
              providerLabel: parsed.providerLabel || null,
            });
            break;
          case "provider":
            onProvider?.(parsed.provider, parsed.providerLabel);
            break;
          case "chunk":
            onChunk?.(parsed.content);
            break;
          case "error":
            onError?.(parsed.content);
            break;
          case "done":
            doneReceived = true;
            onDone?.();
            break;
          default:
            break;
        }
      } catch (e) {
        // 忽略解析失败的行
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 处理连接结束前遗留在 buffer 的最后一行
        if (buffer.trim()) {
          handleSSELine(buffer);
          buffer = "";
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        handleSSELine(line);
      }
    }

    // 后端异常关闭或分片边界问题导致未收到 done 事件时，兜底收尾，避免前端卡住。
    if (!doneReceived) {
      onDone?.();
    }
  },

  // 非流式发送消息（备用）
  sendMessage: async (message, chatId = null) => {
    try {
      const response = await axios.post("/chat/send", { message, chatId });
      return response.data;
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  },

  // 获取对话列表
  getChatList: async () => {
    try {
      const response = await axios.get("/chat/history");
      return response.data;
    } catch (error) {
      console.error("获取对话列表失败:", error);
      throw error;
    }
  },

  // 获取单个对话详情
  getChatDetail: async (chatId) => {
    try {
      const response = await axios.get(`/chat/history/${chatId}`);
      return response.data;
    } catch (error) {
      console.error("获取对话详情失败:", error);
      throw error;
    }
  },

  // 删除对话
  deleteChat: async (chatId) => {
    try {
      const response = await axios.delete(`/chat/history/${chatId}`);
      return response.data;
    } catch (error) {
      console.error("删除对话失败:", error);
      throw error;
    }
  },
};
