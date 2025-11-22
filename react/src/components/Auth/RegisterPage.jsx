import React from 'react';
import { RegisterForm } from './RegisterForm';

export const RegisterPage = () => {
  return (
    <div data-easytag="id1-react/src/components/Auth/RegisterPage.jsx" className="auth-page auth-page-register">
      <div className="auth-page-card">
        <h1 className="auth-page-title">Регистрация</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
