import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/profile';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { authToken, currentMember, setMember, logout } = useAuth();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [nickname, setNickname] = useState('');
  const [nicknameSubmitting, setNicknameSubmitting] = useState(false);
  const [nicknameSuccess, setNicknameSuccess] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!authToken) {
      return;
    }
    if (currentMember) {
      if (currentMember.nickname) {
        setNickname(currentMember.nickname);
      }
      return;
    }
    setIsLoadingProfile(true);
    setProfileError('');
    getProfile()
      .then(data => {
        setMember(data);
        if (data && data.nickname) {
          setNickname(data.nickname);
        }
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        } else {
          setProfileError('Не удалось загрузить профиль. Попробуйте позже.');
        }
      })
      .finally(() => {
        setIsLoadingProfile(false);
      });
  }, [authToken, currentMember, setMember, logout, navigate]);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleNicknameSubmit = event => {
    event.preventDefault();
    if (!nickname) {
      setNicknameError('Введите новый никнейм.');
      setNicknameSuccess('');
      return;
    }
    setNicknameSubmitting(true);
    setNicknameError('');
    setNicknameSuccess('');
    updateProfile({ nickname })
      .then(data => {
        setMember(data);
        if (data && data.nickname) {
          setNickname(data.nickname);
        }
        setNicknameSuccess('Никнейм успешно обновлен.');
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        } else {
          setNicknameError('Не удалось обновить никнейм. Проверьте данные и попробуйте снова.');
        }
      })
      .finally(() => {
        setNicknameSubmitting(false);
      });
  };

  const handlePasswordSubmit = event => {
    event.preventDefault();
    if (!oldPassword || !newPassword) {
      setPasswordError('Заполните оба поля пароля.');
      setPasswordSuccess('');
      return;
    }
    setPasswordSubmitting(true);
    setPasswordError('');
    setPasswordSuccess('');
    updateProfile({ old_password: oldPassword, new_password: newPassword })
      .then(() => {
        setOldPassword('');
        setNewPassword('');
        setPasswordSuccess('Пароль успешно изменен.');
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        } else {
          setPasswordError('Не удалось изменить пароль. Проверьте данные и попробуйте снова.');
        }
      })
      .finally(() => {
        setPasswordSubmitting(false);
      });
  };

  if (!authToken) {
    return (
      <div data-easytag="id1-react/src/components/Profile/ProfilePage.jsx" className="profile-page">
        <h1 className="profile-page-title">Профиль пользователя</h1>
        <p className="profile-page-message">Для доступа к профилю необходимо войти.</p>
        <div className="profile-page-links">
          <Link to="/login" className="profile-link-button">Войти</Link>
          <Link to="/register" className="profile-link-button">Зарегистрироваться</Link>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div data-easytag="id1-react/src/components/Profile/ProfilePage.jsx" className="profile-page">
        <h1 className="profile-page-title">Профиль пользователя</h1>
        <p className="profile-page-message">Загрузка профиля...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div data-easytag="id1-react/src/components/Profile/ProfilePage.jsx" className="profile-page">
        <h1 className="profile-page-title">Профиль пользователя</h1>
        <p className="profile-page-error">{profileError}</p>
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div data-easytag="id1-react/src/components/Profile/ProfilePage.jsx" className="profile-page">
        <h1 className="profile-page-title">Профиль пользователя</h1>
        <p className="profile-page-error">Профиль недоступен.</p>
      </div>
    );
  }

  return (
    <div data-easytag="id1-react/src/components/Profile/ProfilePage.jsx" className="profile-page">
      <h1 className="profile-page-title">Профиль пользователя</h1>
      <div className="profile-section">
        <h2 className="profile-section-title">Текущие данные</h2>
        <div className="profile-field">
          <span className="profile-field-label">Текущий никнейм:</span>
          <span className="profile-field-value">{currentMember.nickname}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Смена никнейма</h2>
        <form className="profile-form" onSubmit={handleNicknameSubmit}>
          <label className="profile-label">
            Новый никнейм
            <input
              type="text"
              className="profile-input"
              value={nickname}
              onChange={event => setNickname(event.target.value)}
            />
          </label>
          {nicknameError && <div className="profile-error-text">{nicknameError}</div>}
          {nicknameSuccess && <div className="profile-success-text">{nicknameSuccess}</div>}
          <button className="profile-button" type="submit" disabled={nicknameSubmitting}>
            {nicknameSubmitting ? 'Сохранение...' : 'Сохранить никнейм'}
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Смена пароля</h2>
        <form className="profile-form" onSubmit={handlePasswordSubmit}>
          <label className="profile-label">
            Текущий пароль
            <input
              type="password"
              className="profile-input"
              value={oldPassword}
              onChange={event => setOldPassword(event.target.value)}
            />
          </label>
          <label className="profile-label">
            Новый пароль
            <input
              type="password"
              className="profile-input"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
            />
          </label>
          {passwordError && <div className="profile-error-text">{passwordError}</div>}
          {passwordSuccess && <div className="profile-success-text">{passwordSuccess}</div>}
          <button className="profile-button" type="submit" disabled={passwordSubmitting}>
            {passwordSubmitting ? 'Сохранение...' : 'Сменить пароль'}
          </button>
        </form>
      </div>

      <div className="profile-section">
        <button className="profile-logout-button" type="button" onClick={handleLogoutClick}>
          Выйти
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
