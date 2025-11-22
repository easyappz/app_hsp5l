import instance from './interceptors';

export async function register(payload) {
  const response = await instance.post('/api/auth/register/', {
    nickname: payload.nickname,
    password: payload.password,
  });
  return response.data;
}

export async function login(payload) {
  const response = await instance.post('/api/auth/login/', {
    nickname: payload.nickname,
    password: payload.password,
  });
  return response.data;
}

export async function getCurrentMember() {
  const response = await instance.get('/api/auth/me/');
  return response.data;
}

export async function logout() {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
}
