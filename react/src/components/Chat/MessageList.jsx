import React from 'react';

export const MessageList = ({ messages }) => {
  const formatDateTime = value => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div data-easytag="id1-react/src/components/Chat/MessageList.jsx" className="chat-message-list">
      {messages.length === 0 ? (
        <div className="chat-message-empty">Сообщений пока нет</div>
      ) : (
        messages.map(message => {
          const authorNickname =
            message && message.author && message.author.nickname
              ? message.author.nickname
              : 'Неизвестный пользователь';
          const createdAt = formatDateTime(message.created_at);
          return (
            <div key={message.id} className="chat-message-item">
              <div className="chat-message-header">
                <span className="chat-message-author">{authorNickname}</span>
                <span className="chat-message-time">{createdAt}</span>
              </div>
              <div className="chat-message-text">{message.text}</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
