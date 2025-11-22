import instance from './interceptors';

export async function fetchMessages(options) {
  const params = {};
  if (typeof options.limit === 'number') {
    params.limit = options.limit;
  }
  if (typeof options.afterId === 'number') {
    params.after_id = options.afterId;
  }
  const response = await instance.get('/api/chat/messages/', { params });
  return response.data;
}

export async function sendMessage(payload) {
  const response = await instance.post('/api/chat/messages/', {
    text: payload.text,
  });
  return response.data;
}
