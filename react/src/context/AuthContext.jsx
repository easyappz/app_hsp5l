import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  authToken: null,
  currentMember: null,
  login: () => {},
  logout: () => {},
  setMember: () => {},
  initializeFromStorage: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);

  const initializeFromStorage = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedToken = window.localStorage.getItem('authToken');
    const storedMember = window.localStorage.getItem('currentMember');
    if (storedToken) {
      setAuthToken(storedToken);
    }
    if (storedMember) {
      try {
        const parsedMember = JSON.parse(storedMember);
        setCurrentMember(parsedMember);
      } catch (error) {
        setCurrentMember(null);
      }
    }
  }, []);

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  const login = useCallback((token, member) => {
    setAuthToken(token);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('authToken', token);
      if (member) {
        setCurrentMember(member);
        window.localStorage.setItem('currentMember', JSON.stringify(member));
      }
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentMember(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('currentMember');
    }
  }, []);

  const setMember = useCallback(member => {
    setCurrentMember(member);
    if (typeof window !== 'undefined') {
      if (member) {
        window.localStorage.setItem('currentMember', JSON.stringify(member));
      } else {
        window.localStorage.removeItem('currentMember');
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      authToken,
      currentMember,
      login,
      logout,
      setMember,
      initializeFromStorage,
    }),
    [authToken, currentMember, login, logout, setMember, initializeFromStorage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  return context;
};

export default AuthContext;
