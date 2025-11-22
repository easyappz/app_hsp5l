import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../Auth/LoginForm';
import { RegisterForm } from '../Auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { ChatBox } from '../Chat/ChatBox';

export const Home = () => {
  const { currentMember, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {}
  }, [logout]);

  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx" className="home-page">
      <div className="home-layout">
        <section className="home-chat">
          <ChatBox />
        </section>
        <aside className="home-auth">
          <h2 className="home-auth-title">Авторизация и регистрация</h2>
          {currentMember ? (
            <div className="home-auth-logged">
              <p className="home-auth-message">
                Вы авторизованы как <span className="home-auth-nickname">{currentMember.nickname}</span>
              </p>
              <div className="home-auth-actions">
                <Link to="/profile" className="home-auth-link">
                  Перейти в профиль
                </Link>
                <button type="button" className="home-auth-logout-button" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <div className="home-auth-forms">
              <div className="home-auth-card">
                <h3 className="home-auth-card-title">Вход</h3>
                <LoginForm />
              </div>
              <div className="home-auth-card">
                <h3 className="home-auth-card-title">Регистрация</h3>
                <RegisterForm />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Home;
