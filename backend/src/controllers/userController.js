const userService = require('../services/userService');

class UserController {
  /**
   * GET /api/users
   * Lista todos os usuários do salão (apenas ADMIN)
   */
  async listUsers(req, res, next) {
    try {
      const salonId = req.salonId;
      const { role, active, search } = req.query;

      const filters = {
        ...(role && { role }),
        ...(active !== undefined && { active: active === 'true' }),
        ...(search && { search }),
      };

      const users = await userService.listUsers(salonId, filters);

      return res.json({
        success: true,
        data: users,
        total: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/professionals
   * Lista apenas profissionais ativos (para seleção)
   */
  async listProfessionals(req, res, next) {
    try {
      const salonId = req.salonId;
      const professionals = await userService.listActiveProfessionals(salonId);

      return res.json({
        success: true,
        data: professionals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Busca um usuário por ID (apenas ADMIN)
   */
  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const salonId = req.salonId;

      const user = await userService.getUserById(userId, salonId);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Cria um novo usuário (apenas ADMIN)
   */
  async createUser(req, res, next) {
    try {
      const salonId = req.salonId;
      const data = req.body;

      const user = await userService.createUser(salonId, data);

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Atualiza um usuário (apenas ADMIN)
   */
  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const salonId = req.salonId;
      const data = req.body;

      const user = await userService.updateUser(userId, salonId, data);

      return res.json({
        message: 'Usuário atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/active
   * Ativa ou desativa um usuário (apenas ADMIN)
   */
  async toggleUserActive(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const salonId = req.salonId;
      const { active } = req.body;

      if (active === undefined) {
        return res.status(400).json({
          error: 'O campo "active" é obrigatório',
        });
      }

      const user = await userService.toggleUserActive(userId, salonId, active);

      return res.json({
        message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/me/profile
   * Retorna dados do próprio usuário
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const salonId = req.salonId;

      const user = await userService.getUserById(userId, salonId);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/me
   * Atualiza dados do próprio usuário
   */
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const salonId = req.salonId;
      const { name, phone } = req.body;

      // Usuário só pode alterar nome e telefone próprio
      const data = {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      };

      const user = await userService.updateUser(userId, salonId, data);

      return res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

