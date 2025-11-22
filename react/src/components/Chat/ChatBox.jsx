import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMessages, sendMessage } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { MessageList } from './MessageList';

export const ChatBox = () => {
  const { currentMember } = useAuth();
  const isAuthorized = !!currentMember;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesRef = useRef([]);
  const lastMessageIdRef = useRef(null);

  const updateMessages = useCallback(newMessages => {
    setMessages(newMessages);
    messagesRef.current = newMessages;
    if (newMessages.length > 0) {
      const lastMessage = newMessages[newMessages.length - 1];
      lastMessageIdRef.current = typeof lastMessage.id === 'number' ? lastMessage.id : null;
    } else {
      lastMessageIdRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, []);

  const loadInitialMessages = useCallback(async () => {
    if (!isAuthorized) {
      updateMessages([]);
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchMessages({ limit: 50 });
      const items = Array.isArray(data) ? data.slice() : [];
      items.sort((first, second) => {
        if (typeof first.id !== 'number' || typeof second.id !== 'number') {
          return 0;
        }
        if (first.id < second.id) {
          return -1;
        }
        if (first.id > second.id) {
          return 1;
        }
        return 0;
      });
      updateMessages(items);
      scrollToBottom();
    } catch (requestError) {
      setError('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, scrollToBottom, updateMessages]);

  useEffect(() => {
    let isCancelled = false;
    let intervalId = null;

    const startPolling = () => {
      intervalId = window.setInterval(async () => {
        if (!isAuthorized) {
          return;
        }
        const lastId = lastMessageIdRef.current;
        const options = {};
        if (typeof lastId === 'number') {
          options.afterId = lastId;
        } else {
          options.limit = 50;
        }
        try {
          const data = await fetchMessages(options);
          const newItems = Array.isArray(data) ? data : [];
          if (newItems.length === 0) {
            return;
          }
          const combined = messagesRef.current.concat(newItems);
          const seen = {};
          const unique = [];
          for (let index = 0; index < combined.length; index += 1) {
            const item = combined[index];
            if (!item || typeof item.id !== 'number') {
              continue;
            }
            if (!seen[item.id]) {
              seen[item.id] = true;
              unique.push(item);
            }
          }
          unique.sort((first, second) => {
            if (typeof first.id !== 'number' || typeof second.id !== 'number') {
              return 0;
            }
            if (first.id < second.id) {
              return -1;
            }
            if (first.id > second.id) {
              return 1;
            }
            return 0;
          });
          if (!isCancelled) {
            updateMessages(unique);
            scrollToBottom();
          }
        } catch (requestError) {}
      }, 4000);
    };

    loadInitialMessages();
    startPolling();

    return () => {
      isCancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthorized, loadInitialMessages, scrollToBottom, updateMessages]);

  useEffect(() => {
    if (!isAuthorized) {
      updateMessages([]);
      setError('');
      setText('');
    }
  }, [isAuthorized, updateMessages]);

  const handleChangeText = event => {
    setText(event.target.value);
  };

  const handleSend = async event => {
    event.preventDefault();
    if (!isAuthorized) {
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const created = await sendMessage({ text: trimmed });
      if (created) {
        const combined = messagesRef.current.concat(created);
        const seen = {};
        const unique = [];
        for (let index = 0; index < combined.length; index += 1) {
          const item = combined[index];
          if (!item || typeof item.id !== 'number') {
            continue;
          }
          if (!seen[item.id]) {
            seen[item.id] = true;
            unique.push(item);
          }
        }
        unique.sort((first, second) => {
          if (typeof first.id !== 'number' || typeof second.id !== 'number') {
            return 0;
          }
          if (first.id < second.id) {
            return -1;
          }
          if (first.id > second.id) {
            return 1;
          }
          return 0;
        });
        updateMessages(unique);
        setText('');
        scrollToBottom();
      }
    } catch (requestError) {
      setError('Не удалось отправить сообщение');
    } finally {
      setIsSending(false);
    }
  };

  const isInputDisabled = !isAuthorized || loading || isSending;
  const isButtonDisabled = isInputDisabled || !text.trim();

  return (
    <div data-easytag="id1-react/src/components/Chat/ChatBox.jsx" className="chat-box">
      <header className="chat-header">
        <h1 className="chat-title">Групповой чат</h1>
        {isAuthorized && currentMember ? (
          <div className="chat-status">Вы вошли как {currentMember.nickname}</div>
        ) : (
          <div className="chat-status chat-status-anonymous">
            Чтобы пользоваться чатом, войдите или зарегистрируйтесь.
          </div>
        )}
      </header>
      <div className="chat-body">
        <div className="chat-messages" ref={messagesContainerRef}>
          {loading && messages.length === 0 ? (
            <div className="chat-message-loading">Загрузка сообщений...</div>
          ) : null}
          {error ? <div className="chat-message-error">{error}</div> : null}
          {!loading || messages.length > 0 ? <MessageList messages={messages} /> : null}
        </div>
        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            className="chat-input"
            type="text"
            placeholder={
              isAuthorized
                ? 'Введите сообщение'
                : 'Войдите или зарегистрируйтесь, чтобы отправлять сообщения'
            }
            value={text}
            onChange={handleChangeText}
            disabled={isInputDisabled}
          />
          <button className="chat-send-button" type="submit" disabled={isButtonDisabled}>
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
