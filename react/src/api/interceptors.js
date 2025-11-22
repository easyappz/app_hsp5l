import instance from './axios';

instance.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      token = localStorage.getItem('authToken');
    } catch (e) {
      token = null;
    }
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('authToken');
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default instance;
