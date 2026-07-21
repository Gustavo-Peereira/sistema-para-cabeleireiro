const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/login
   * Login de usuário
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validação básica
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios',
        });
      }

      const result = await authService.login(email, password);

      return res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Retorna dados do usuário logado
   */
  async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const salonId = req.user.salonId;

      const user = await authService.getMe(userId, salonId);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   * Altera senha do usuário
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: 'Senha atual e nova senha são obrigatórias',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'A nova senha deve ter no mínimo 6 caracteres',
        });
      }

      const result = await authService.changePassword(
        req.user.id,
        req.salonId,
        oldPassword,
        newPassword
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

