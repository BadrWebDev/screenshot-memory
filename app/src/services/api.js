import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.38:8000/api',
  timeout: 30000,
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

export default api;