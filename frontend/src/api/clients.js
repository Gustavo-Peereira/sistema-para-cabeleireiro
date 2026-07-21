import api from './axios';

export const clientsAPI = {
  list: (params) => {
    return api.get('/clients', { params });
  },

  searchByPhone: (phone) => {
    return api.get('/clients/search-phone', { params: { phone } });
  },

  getById: (id, includeAppointments = false) => {
    return api.get(`/clients/${id}`, { params: { appointments: includeAppointments } });
  },

  create: (data) => {
    return api.post('/clients', data);
  },

  update: (id, data) => {
    return api.put(`/clients/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/clients/${id}`);
  },
};



