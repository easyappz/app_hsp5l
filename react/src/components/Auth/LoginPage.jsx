import React from 'react';
import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  return (
    <div data-easytag="id1-react/src/components/Auth/LoginPage.jsx" className="auth-page auth-page-login">
      <div className="auth-page-card">
        <h1 className="auth-page-title">Вход</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
