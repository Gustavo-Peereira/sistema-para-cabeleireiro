import api from './axios';

export const usersAPI = {
  /**
   * Lista todos os usuários do salão
   */
  list: (params = {}) => api.get('/users', { params }),

  /**
   * Busca um usuário por ID
   */
  getById: (id) => api.get(`/users/${id}`),

  /**
   * Cria um novo usuário
   */
  create: (data) => api.post('/users', data),

  /**
   * Atualiza um usuário
   */
  update: (id, data) => api.put(`/users/${id}`, data),

  /**
   * Ativa ou desativa um usuário
   */
  toggleActive: (id, active) => api.patch(`/users/${id}/active`, { active }),

  /**
   * Lista apenas profissionais ativos
   */
  listProfessionals: () => api.get('/users/professionals'),

  /**
   * Atualiza o próprio perfil
   */
  updateMe: (data) => api.put('/users/me', data),
};
