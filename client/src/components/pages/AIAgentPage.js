import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import styled, { keyframes } from "styled-components";
import {
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaRobot,
  FaUser,
  FaHistory,
  FaStop,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import { chatApi } from "../../services/chatService";

const AIAgentPage = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [chatId, setChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const requestAbortRef = useRef(null);

  // 加载对话列表
  useEffect(() => {
    loadChatList();
  }, []);

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 80;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  };

  const scrollToBottom = (behavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  // 仅在用户位于底部附近时自动跟随，避免阅读历史消息时被强制拉回底部
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom(streaming ? "auto" : "smooth");
    }
  }, [messages, streaming]);

  const handleMessagesScroll = () => {
    shouldAutoScrollRef.current = isNearBottom();
  };

  const loadChatList = async () => {
    try {
      const res = await chatApi.getChatList();
      if (res.success) {
        setChatList(res.data);
      }
    } catch (err) {
      console.error("加载对话列表失败:", err);
    }
  };

  // 流式发送消息
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || loading || streaming) return;

    setInputValue("");
    shouldAutoScrollRef.current = true;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setStreaming(true);

    const controller = new AbortController();
    requestAbortRef.current = controller;

    // 先添加一个空的 assistant 消息，后续逐字填充
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await chatApi.streamMessage(
        text,
        chatId,
        // onChunk: 每收到一块内容，追加到最后一条 assistant 消息
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: lastMsg.content + chunk,
              };
            }
            return updated;
          });
        },
        // onStart: 收到 chatId 和标题
        (newChatId, title, meta) => {
          setChatId(newChatId);
          setLoading(false); // 收到第一个信号后隐藏加载状态
          if (
            meta?.provider ||
            meta?.providerLabel ||
            meta?.hasRag !== undefined
          ) {
            console.info("[AI Assistant] stream start:", {
              chatId: newChatId,
              title,
              hasRag: meta?.hasRag ?? null,
              provider: meta?.provider ?? null,
              providerLabel: meta?.providerLabel ?? null,
            });
          }
        },
        // onError
        (errorMsg) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: errorMsg || "抱歉，服务暂时不可用，请稍后再试。",
              };
            }
            return updated;
          });
        },
        // onDone
        () => {
          setStreaming(false);
          loadChatList();
          inputRef.current?.focus();
        },
        (provider, providerLabel) => {
          console.info("[AI Assistant] provider selected:", {
            provider,
            providerLabel,
          });
        },
        controller.signal,
      );
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("流式请求失败:", err);
      }
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (
          err?.name !== "AbortError" &&
          lastMsg &&
          lastMsg.role === "assistant" &&
          !lastMsg.content
        ) {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: "抱歉，服务暂时不可用，请稍后再试。",
          };
        }
        return updated;
      });
      setStreaming(false);
    } finally {
      requestAbortRef.current = null;
      setLoading(false);
    }
  }, [inputValue, loading, streaming, chatId]);

  const handleStopStreaming = () => {
    if (!streaming) return;
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setStreaming(false);
    setLoading(false);

    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant" && !last?.content?.trim()) {
        updated[updated.length - 1] = {
          ...last,
          content: "已停止生成。",
        };
      }
      return updated;
    });
  };

  // 按回车发送
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 新建对话
  const handleNewChat = () => {
    if (streaming) return;
    setChatId(null);
    setMessages([]);
    shouldAutoScrollRef.current = true;
  };

  // 加载历史对话
  const handleLoadChat = async (id) => {
    if (streaming) return;
    try {
      setLoading(true);
      const res = await chatApi.getChatDetail(id);
      if (res.success) {
        setChatId(res.data._id);
        setMessages(res.data.messages);
        shouldAutoScrollRef.current = false;
      }
    } catch (err) {
      console.error("加载对话失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 删除对话
  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (streaming) return;
    try {
      await chatApi.deleteChat(id);
      if (chatId === id) {
        handleNewChat();
      }
      loadChatList();
    } catch (err) {
      console.error("删除对话失败:", err);
    }
  };

  // 快捷提问
  const handleSuggestion = (q) => {
    setInputValue(q);
    inputRef.current?.focus();
  };

  return (
    <PageContainer>
      {/* 左侧边栏 - 对话历史 */}
      <Sidebar $open={sidebarOpen}>
        <SidebarHeader>
          <NewChatButton onClick={handleNewChat} disabled={streaming}>
            <FaPlus /> 新建对话
          </NewChatButton>
        </SidebarHeader>
        <ChatListContainer>
          {chatList.map((chat) => (
            <ChatListItem
              key={chat._id}
              $active={chatId === chat._id}
              onClick={() => handleLoadChat(chat._id)}
            >
              <FaHistory />
              <ChatItemTitle>{chat.title}</ChatItemTitle>
              <DeleteButton onClick={(e) => handleDeleteChat(e, chat._id)}>
                <FaTrash />
              </DeleteButton>
            </ChatListItem>
          ))}
          {chatList.length === 0 && <EmptyHint>暂无对话记录</EmptyHint>}
        </ChatListContainer>
      </Sidebar>

      {/* 右侧主区域 */}
      <MainArea>
        <ChatHeader>
          <ToggleSidebar onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaHistory />
          </ToggleSidebar>
          <HeaderTitle>
            <FaRobot /> 知识产权智能助手
          </HeaderTitle>
          {streaming && <StreamingBadge>回答中...</StreamingBadge>}
        </ChatHeader>

        <MessagesContainer
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
        >
          {messages.length === 0 ? (
            <WelcomeContainer>
              <WelcomeIcon>
                <FaRobot />
              </WelcomeIcon>
              <WelcomeTitle>北邮知识产权智能助手</WelcomeTitle>
              <WelcomeText>
                您好，{user?.nickname || user?.username}
                ！我可以为您解答知识产权相关问题，包括专利、商标、著作权等领域。
              </WelcomeText>
              <SuggestionsGrid>
                {[
                  "如何申请专利？",
                  "商标注册的流程是什么？",
                  "遭遇知识产权侵权怎么办？",
                  "著作权的保护期限是多久？",
                ].map((q, i) => (
                  <SuggestionCard key={i} onClick={() => handleSuggestion(q)}>
                    {q}
                  </SuggestionCard>
                ))}
              </SuggestionsGrid>
            </WelcomeContainer>
          ) : (
            messages.map((msg, index) => (
              <MessageRow key={index} $role={msg.role}>
                <Avatar $role={msg.role}>
                  {msg.role === "user" ? <FaUser /> : <FaRobot />}
                </Avatar>
                <MessageBubble $role={msg.role}>
                  {msg.content}
                  {/* 流式输出时最后一条 assistant 消息显示光标 */}
                  {streaming &&
                    msg.role === "assistant" &&
                    index === messages.length - 1 && <Cursor />}
                </MessageBubble>
              </MessageRow>
            ))
          )}
          {/* 等待第一个 chunk 时显示打字动画 */}
          {loading && (
            <MessageRow $role="assistant">
              <Avatar $role="assistant">
                <FaRobot />
              </Avatar>
              <MessageBubble $role="assistant">
                <TypingIndicator>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingIndicator>
              </MessageBubble>
            </MessageRow>
          )}
        </MessagesContainer>

        {/* 输入区域 */}
        <InputArea>
          <InputWrapper>
            <StyledTextarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入您的知识产权相关问题..."
              rows={1}
              disabled={streaming}
            />
            <SendButton
              onClick={streaming ? handleStopStreaming : handleSend}
              disabled={streaming ? false : !inputValue.trim() || loading}
              title={streaming ? "停止生成" : "发送"}
            >
              {streaming ? <FaStop /> : <FaPaperPlane />}
            </SendButton>
          </InputWrapper>
          <Disclaimer>AI回答仅供参考，具体法律问题请咨询专业律师</Disclaimer>
        </InputArea>
      </MainArea>
    </PageContainer>
  );
};

// ========== Animations ==========

const typingBounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
`;

const cursorPulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 16px rgba(37, 99, 235, 0.3);
  }
  50% {
    box-shadow: 0 0 24px rgba(37, 99, 235, 0.5);
  }
`;

// ========== Styled Components ==========

const PageContainer = styled.div`
  display: flex;
  height: calc(100vh - 130px);
  background: linear-gradient(135deg, #f0f5ff 0%, #f8fafc 50%, #f0fdfa 100%);
  position: relative;
`;

const Sidebar = styled.aside`
  width: ${(props) => (props.$open ? "300px" : "0")};
  background: var(--glass-dark-bg, rgba(15, 23, 42, 0.92));
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: absolute;
    z-index: 100;
    height: 100%;
    width: ${(props) => (props.$open ? "300px" : "0")};
    box-shadow: ${(props) =>
      props.$open ? "4px 0 24px rgba(0, 0, 0, 0.3)" : "none"};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%));
  color: white;
  border: none;
  border-radius: var(--border-radius-lg, 12px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.4), 0 4px 12px rgba(37, 99, 235, 0.25);
    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const ChatListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: ${(props) =>
    props.$active ? "white" : "rgba(255, 255, 255, 0.7)"};
  background: ${(props) =>
    props.$active ? "rgba(37, 99, 235, 0.3)" : "transparent"};
  transition: all 0.2s ease;
  margin-bottom: 2px;
  border: 1px solid ${(props) =>
    props.$active ? "rgba(37, 99, 235, 0.25)" : "transparent"};

  svg {
    font-size: 12px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  &:hover {
    background: ${(props) =>
      props.$active
        ? "rgba(37, 99, 235, 0.35)"
        : "rgba(255, 255, 255, 0.06)"};
    color: white;
  }
`;

const ChatItemTitle = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 4px;
  font-size: 11px;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 4px;

  ${ChatListItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
  }
`;

const EmptyHint = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 24px 16px;
  font-size: 13px;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const ToggleSidebar = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #94a3b8;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
  }
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;

  svg {
    -webkit-text-fill-color: initial;
    background: none;
    color: #3b82f6;
  }
`;

const StreamingBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  margin-left: auto;
  animation: ${cursorPulse} 2s ease-in-out infinite;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.14);
  }
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
  max-width: 560px;
  margin: 0 auto;
`;

const WelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-xl, 20px);
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.25);

  svg {
    font-size: 36px;
    color: white;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`;

const WelcomeText = styled.p`
  font-size: 15px;
  color: #64748b;
  max-width: 440px;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 560px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionCard = styled.div`
  padding: 16px 18px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.72));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--border-radius-lg, 14px);
  cursor: pointer;
  font-size: 14px;
  color: #334155;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  line-height: 1.5;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow:
      0 4px 16px rgba(37, 99, 235, 0.12),
      0 0 0 1px rgba(37, 99, 235, 0.08);
    color: #1e40af;
  }

  &:active {
    transform: translateY(0);
  }
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
  flex-direction: ${(props) =>
    props.$role === "user" ? "row-reverse" : "row"};
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  background: ${(props) =>
    props.$role === "user"
      ? "var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 100%))"
      : "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)"};
  color: ${(props) =>
    props.$role === "user" ? "white" : "#3b82f6"};
  box-shadow: ${(props) =>
    props.$role === "user"
      ? "0 2px 8px rgba(37, 99, 235, 0.2)"
      : "0 2px 8px rgba(59, 130, 246, 0.1)"};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 14px 18px;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;

  background: ${(props) =>
    props.$role === "user"
      ? "var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%))"
      : "var(--glass-bg, rgba(255, 255, 255, 0.72))"};
  backdrop-filter: ${(props) =>
    props.$role === "user" ? "none" : "blur(16px)"};
  -webkit-backdrop-filter: ${(props) =>
    props.$role === "user" ? "none" : "blur(16px)"};
  color: ${(props) => (props.$role === "user" ? "white" : "#1e293b")};
  border: ${(props) =>
    props.$role === "user"
      ? "none"
      : "1px solid var(--glass-border, rgba(255, 255, 255, 0.18))"};
  border-radius: ${(props) =>
    props.$role === "user"
      ? "18px 18px 4px 18px"
      : "18px 18px 18px 4px"};
  box-shadow: ${(props) =>
    props.$role === "user"
      ? "0 4px 16px rgba(37, 99, 235, 0.2)"
      : "var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.06))"};
`;

const Cursor = styled.span`
  display: inline-block;
  width: 3px;
  height: 18px;
  background: var(--gradient-primary, linear-gradient(180deg, #2563eb, #06b6d4));
  margin-left: 3px;
  vertical-align: text-bottom;
  border-radius: 2px;
  animation: ${cursorPulse} 1.2s ease-in-out infinite;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 5px;
  padding: 4px 0;
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: ${typingBounce} 1.4s ease-in-out infinite;

    &:nth-child(1) {
      background: var(--primary-400, #60a5fa);
      animation-delay: 0s;
    }
    &:nth-child(2) {
      background: var(--accent-cyan, #06b6d4);
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      background: #a78bfa;
      animation-delay: 0.3s;
    }
  }
`;

const InputArea = styled.div`
  padding: 16px 24px 20px;
  background: transparent;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.82));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--border-radius-xl, 24px);
  padding: 8px 10px 8px 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.06));
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--primary-400, #60a5fa);
    box-shadow:
      var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.06)),
      0 0 0 4px rgba(37, 99, 235, 0.08);
  }
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 120px;
  color: #1e293b;
  padding: 6px 0;

  &::placeholder {
    color: #94a3b8;
  }
`;

const SendButton = styled.button`
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%));
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Disclaimer = styled.p`
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 10px;
  margin-bottom: 0;
`;

export default AIAgentPage;
