import instance from './interceptors';

export async function getProfile() {
  const response = await instance.get('/api/profile/');
  return response.data;
}

export async function updateProfile(payload) {
  const response = await instance.patch('/api/profile/', payload);
  return response.data;
}
