import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import { Home } from './components/Home';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ProfilePage } from './components/Profile/ProfilePage';

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/login', '/register', '/profile']);
    }
  }, []);

  return (
    <div data-easytag="id1-react/src/App.jsx">
      <ErrorBoundary>
        <header className="app-header">
          <nav className="app-nav">
            <ul className="app-nav-list">
              <li className="app-nav-item">
                <Link to="/">Главная</Link>
              </li>
              <li className="app-nav-item">
                <Link to="/login">Вход</Link>
              </li>
              <li className="app-nav-item">
                <Link to="/register">Регистрация</Link>
              </li>
              <li className="app-nav-item">
                <Link to="/profile">Профиль</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default App;
