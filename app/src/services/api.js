import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.39:8000/api',
  timeout: 120000,
});

export const uploadScreenshot = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'screenshot.jpg',
  });

  const response = await api.post('/screenshots', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const getScreenshots = async () => {
  const response = await api.get('/screenshots');
  return response.data;
};

export const deleteScreenshot = async (id) => {
  await api.delete(`/screenshots/${id}`);
};

export const deleteAllScreenshots = async () => {
  await api.delete('/screenshots/all');
};

export const updateScreenshot = async (id, payload) => {
  const response = await api.patch(`/screenshots/${id}`, payload);
  return response.data;
};

export const reanalyzeScreenshot = async (id) => {
  const response = await api.post(`/screenshots/${id}/reanalyze`);
  return response.data;
};

export default api;