import api from './axios';

export const blocksAPI = {
  /**
   * Lista bloqueios com filtros opcionais
   */
  list: (params = {}) => api.get('/blocks', { params }),

  /**
   * Busca um bloqueio por ID
   */
  getById: (id) => api.get(`/blocks/${id}`),

  /**
   * Cria um novo bloqueio
   */
  create: (data) => api.post('/blocks', data),

  /**
   * Remove um bloqueio
   */
  delete: (id) => api.delete(`/blocks/${id}`),
};
