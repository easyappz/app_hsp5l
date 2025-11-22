import React, { useState } from 'react';
import { login as loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export const LoginForm = () => {
  const { login } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    if (!nickname || !password) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest({ nickname, password });
      if (data && data.token && data.member) {
        login(data.token, data.member);
      } else {
        setError('Неверный ответ сервера');
      }
    } catch (requestError) {
      let message = 'Неверный никнейм или пароль';
      if (requestError && requestError.response && requestError.response.data) {
        const serverDetail = requestError.response.data.detail;
        if (typeof serverDetail === 'string' && serverDetail.length > 0) {
          message = serverDetail;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Auth/LoginForm.jsx" className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="login-nickname">
            Никнейм
          </label>
          <input
            id="login-nickname"
            className="auth-form-input"
            type="text"
            value={nickname}
            onChange={event => setNickname(event.target.value)}
            placeholder="Введите никнейм"
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            className="auth-form-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Введите пароль"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        {error ? <div className="auth-form-error">{error}</div> : null}
        <button className="auth-form-button" type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
