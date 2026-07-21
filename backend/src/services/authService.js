const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { UnauthorizedError, NotFoundError } = require('../utils/errors');

class AuthService {
  /**
   * Realiza login do usuário
   * @param {String} email - Email do usuário
   * @param {String} password - Senha do usuário
   * @returns {Object} { user, token }
   */
  async login(email, password) {
    // Buscar usuário por email
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            active: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      throw new UnauthorizedError('Usuário inativo. Entre em contato com o administrador');
    }

    // Verificar se salão está ativo
    if (!user.salon.active) {
      throw new UnauthorizedError('Salão inativo. Entre em contato com o suporte');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      salonId: user.salonId,
      role: user.role,
    });

    // Retornar dados do usuário (sem a senha) e token
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Busca dados do usuário logado
   * @param {Number} userId - ID do usuário
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do usuário
   */
  async getMe(userId, salonId) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        salonId: salonId,
      },
      include: {
        salon: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Remover senha
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Altera senha do usuário (funcionalidade futura)
   * @param {Number} userId - ID do usuário
   * @param {String} oldPassword - Senha antiga
   * @param {String} newPassword - Senha nova
   */
  async changePassword(userId, salonId, oldPassword, newPassword) {
    // Buscar usuário garantindo que pertence ao salão
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        salonId: salonId,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Garantir que o usuário pertence ao salão antes de atualizar
    await prisma.user.update({
      where: {
        id: userId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: { password: hashedNewPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}

module.exports = new AuthService();

