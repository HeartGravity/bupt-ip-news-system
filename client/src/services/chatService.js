import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// 智能体聊天相关API
export const chatApi = {
  // 流式发送消息（SSE）
  streamMessage: async (message, chatId, onChunk, onStart, onError, onDone) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, chatId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败 (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);

          switch (parsed.type) {
            case 'start':
              onStart?.(parsed.chatId, parsed.title);
              break;
            case 'chunk':
              onChunk?.(parsed.content);
              break;
            case 'error':
              onError?.(parsed.content);
              break;
            case 'done':
              onDone?.();
              break;
            default:
              break;
          }
        } catch (e) {
          // 忽略解析失败的行
        }
      }
    }
  },

  // 非流式发送消息（备用）
  sendMessage: async (message, chatId = null) => {
    try {
      const response = await axios.post('/chat/send', { message, chatId });
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  },

  // 获取对话列表
  getChatList: async () => {
    try {
      const response = await axios.get('/chat/history');
      return response.data;
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw error;
    }
  },

  // 获取单个对话详情
  getChatDetail: async (chatId) => {
    try {
      const response = await axios.get(`/chat/history/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('获取对话详情失败:', error);
      throw error;
    }
  },

  // 删除对话
  deleteChat: async (chatId) => {
    try {
      const response = await axios.delete(`/chat/history/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('删除对话失败:', error);
      throw error;
    }
  }
};
