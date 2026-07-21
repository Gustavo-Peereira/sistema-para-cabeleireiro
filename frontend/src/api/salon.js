import api from './axios';

export const salonAPI = {
  /**
   * Retorna dados do salão
   */
  get: () => api.get('/salon'),

  /**
   * Atualiza dados do salão
   */
  update: (data) => api.put('/salon', data),
};
