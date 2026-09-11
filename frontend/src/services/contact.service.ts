import api from './axios.config';

export interface ContactMessageData {
  name: string;
  email: string;
  message: string;
}

export const contactAPI = {
  sendMessage: async (data: ContactMessageData) => {
    const response = await api.post('/contact', data);
    return response.data;
  }
};
