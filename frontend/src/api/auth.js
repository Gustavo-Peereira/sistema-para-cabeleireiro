import api from './axios';

export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  getMe: () => {
    return api.get('/auth/me');
  },

  changePassword: (oldPassword, newPassword) => {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  },
};



