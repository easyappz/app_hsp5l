import React, { useState } from 'react';
import { register as registerRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export const RegisterForm = () => {
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
      const data = await registerRequest({ nickname, password });
      if (data && data.token && data.member) {
        login(data.token, data.member);
      } else {
        setError('Неверный ответ сервера');
      }
    } catch (requestError) {
      let message = 'Не удалось зарегистрироваться. Попробуйте ещё раз.';
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
    <div data-easytag="id1-react/src/components/Auth/RegisterForm.jsx" className="auth-form-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="register-nickname">
            Никнейм
          </label>
          <input
            id="register-nickname"
            className="auth-form-input"
            type="text"
            value={nickname}
            onChange={event => setNickname(event.target.value)}
            placeholder="Придумайте никнейм"
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="auth-form-field">
          <label className="auth-form-label" htmlFor="register-password">
            Пароль
          </label>
          <input
            id="register-password"
            className="auth-form-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Придумайте пароль"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        {error ? <div className="auth-form-error">{error}</div> : null}
        <button className="auth-form-button" type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
