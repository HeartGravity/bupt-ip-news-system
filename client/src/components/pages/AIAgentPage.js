import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import styled from "styled-components";
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

// ========== Styled Components ==========

const PageContainer = styled.div`
  display: flex;
  height: calc(100vh - 130px);
  background-color: #f5f7fa;
`;

const Sidebar = styled.aside`
  width: ${(props) => (props.$open ? "280px" : "0")};
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: absolute;
    z-index: 100;
    height: 100%;
    width: ${(props) => (props.$open ? "280px" : "0")};
  }
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: var(--primary-color, #1a73e8);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: var(--primary-dark, #1557b0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ChatListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const ChatListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${(props) =>
    props.$active ? "var(--primary-color, #1a73e8)" : "#333"};
  background: ${(props) => (props.$active ? "#e8f0fe" : "transparent")};
  transition: background 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#e8f0fe" : "#f5f5f5")};
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
  color: #999;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;

  ${ChatListItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #e74c3c;
  }
`;

const EmptyHint = styled.div`
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
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
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
`;

const ToggleSidebar = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  padding: 4px;

  &:hover {
    color: var(--primary-color, #1a73e8);
  }
`;

const HeaderTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;

  svg {
    color: var(--primary-color, #1a73e8);
  }
`;

const StreamingBadge = styled.span`
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 2px 10px;
  border-radius: 12px;
  margin-left: auto;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
`;

const WelcomeIcon = styled.div`
  font-size: 48px;
  color: var(--primary-color, #1a73e8);
  margin-bottom: 16px;
`;

const WelcomeTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  color: #666;
  max-width: 500px;
  margin-bottom: 24px;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 500px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestionCard = styled.div`
  padding: 14px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--primary-color, #1a73e8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
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
  font-size: 16px;
  background: ${(props) =>
    props.$role === "user" ? "var(--primary-color, #1a73e8)" : "#e8f0fe"};
  color: ${(props) =>
    props.$role === "user" ? "white" : "var(--primary-color, #1a73e8)"};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  background: ${(props) =>
    props.$role === "user" ? "var(--primary-color, #1a73e8)" : "white"};
  color: ${(props) => (props.$role === "user" ? "white" : "#333")};
  border: ${(props) => (props.$role === "user" ? "none" : "1px solid #e8e8e8")};
  border-radius: ${(props) =>
    props.$role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 18px;
  background: var(--primary-color, #1a73e8);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s infinite;

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 8px;
    height: 8px;
    background: #999;
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }
`;

const InputArea = styled.div`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e8e8e8;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: var(--primary-color, #1a73e8);
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

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  background: var(--primary-color, #1a73e8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.2s,
    opacity 0.2s;

  &:hover:not(:disabled) {
    background: var(--primary-dark, #1557b0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Disclaimer = styled.p`
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  margin-bottom: 0;
`;

export default AIAgentPage;
