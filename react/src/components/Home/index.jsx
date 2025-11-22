import React from 'react';

export const Home = () => {
  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx" className="home-page">
      <div className="home-layout">
        <section className="home-chat">
          <h1 className="home-title">Групповой чат</h1>
          <div className="home-chat-placeholder">Область чата</div>
        </section>
        <aside className="home-auth">
          <h2 className="home-auth-title">Авторизация и регистрация</h2>
          <div className="home-auth-forms">
            <div className="home-login-placeholder">Форма входа</div>
            <div className="home-register-placeholder">Форма регистрации</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
