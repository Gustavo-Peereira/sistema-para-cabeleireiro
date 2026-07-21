const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { addTenantFilter } = require('../middlewares/tenant');
const { validatePassword } = require('../utils/validators');

class UserService {
  /**
   * Lista todos os usuários do salão
   * @param {Number} salonId - ID do salão
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de usuários
   */
  async listUsers(salonId, filters = {}) {
    const { role, active, search } = filters;

    const where = addTenantFilter(salonId, {
      ...(role && { role }),
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    });

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        salonId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { active: 'desc' },
        { name: 'asc' },
      ],
    });

    return users;
  }

  /**
   * Busca um usuário por ID
   * @param {Number} userId - ID do usuário
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do usuário
   */
  async getUserById(userId, salonId) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        salonId: salonId,
      },
      select: {
        id: true,
        salonId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Cria um novo usuário (profissional)
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados do usuário
   * @returns {Object} Usuário criado
   */
  async createUser(salonId, data) {
    const { name, email, password, role, phone } = data;

    // Validações
    if (!name || !email || !password) {
      throw new ValidationError('Nome, email e senha são obrigatórios');
    }

    validatePassword(password);

    // Verificar se email já existe no salão
    const existingUser = await prisma.user.findFirst({
      where: {
        salonId: salonId,
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      throw new ConflictError('Este email já está em uso neste salão');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        salonId: salonId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'PROFESSIONAL',
        phone: phone?.trim(),
        active: true,
      },
      select: {
        id: true,
        salonId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Atualiza um usuário
   * @param {Number} userId - ID do usuário
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Usuário atualizado
   */
  async updateUser(userId, salonId, data) {
    const { name, email, phone, role, password } = data;

    // Verificar se usuário existe no salão
    const existingUser = await this.getUserById(userId, salonId);

    // Se está alterando email, verificar se não está em uso
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          salonId: salonId,
          email: email.toLowerCase().trim(),
          NOT: { id: userId },
        },
      });

      if (emailInUse) {
        throw new ConflictError('Este email já está em uso neste salão');
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(phone !== undefined && { phone: phone?.trim() }),
      ...(role && { role }),
    };

    // Se está alterando senha
    if (password) {
      validatePassword(password);
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Garantir que o usuário pertence ao salão antes de atualizar
    const user = await prisma.user.update({
      where: {
        id: userId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: updateData,
      select: {
        id: true,
        salonId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Ativa ou desativa um usuário
   * @param {Number} userId - ID do usuário
   * @param {Number} salonId - ID do salão
   * @param {Boolean} active - true para ativar, false para desativar
   * @returns {Object} Usuário atualizado
   */
  async toggleUserActive(userId, salonId, active) {
    // Verificar se usuário existe no salão
    await this.getUserById(userId, salonId);

    // Garantir que o usuário pertence ao salão antes de atualizar
    const user = await prisma.user.update({
      where: {
        id: userId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: { active },
      select: {
        id: true,
        salonId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Lista apenas profissionais ativos (para seleção em agendamentos)
   * @param {Number} salonId - ID do salão
   * @returns {Array} Lista de profissionais
   */
  async listActiveProfessionals(salonId) {
    const professionals = await prisma.user.findMany({
      where: {
        salonId: salonId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return professionals;
  }
}

module.exports = new UserService();

