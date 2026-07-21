import api from './axios';

export const appointmentsAPI = {
  list: (params) => {
    return api.get('/appointments', { params });
  },

  getById: (id) => {
    return api.get(`/appointments/${id}`);
  },

  create: (data) => {
    return api.post('/appointments', data);
  },

  update: (id, data) => {
    return api.put(`/appointments/${id}`, data);
  },

  updateStatus: (id, status) => {
    return api.patch(`/appointments/${id}/status`, { status });
  },

  cancel: (id) => {
    return api.delete(`/appointments/${id}`);
  },
};



