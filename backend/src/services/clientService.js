const prisma = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { addTenantFilter } = require('../middlewares/tenant');

class ClientService {
  /**
   * Lista todos os clientes do salão
   * @param {Number} salonId - ID do salão
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de clientes
   */
  async listClients(salonId, filters = {}) {
    const { active, search, limit, offset } = filters;

    const where = addTenantFilter(salonId, {
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { cpf: { contains: search } },
        ],
      }),
    });

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        select: {
          id: true,
          salonId: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          birthdate: true,
          notes: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { active: 'desc' },
          { name: 'asc' },
        ],
        ...(limit && { take: parseInt(limit) }),
        ...(offset && { skip: parseInt(offset) }),
      }),
      prisma.client.count({ where }),
    ]);

    return { clients, total };
  }

  /**
   * Busca um cliente por ID
   * @param {Number} clientId - ID do cliente
   * @param {Number} salonId - ID do salão
   * @param {Boolean} includeAppointments - Incluir histórico de agendamentos
   * @returns {Object} Dados do cliente
   */
  async getClientById(clientId, salonId, includeAppointments = false) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        salonId: salonId,
      },
      include: {
        ...(includeAppointments && {
          appointments: {
            include: {
              service: {
                select: { name: true, price: true },
              },
              professional: {
                select: { name: true },
              },
            },
            orderBy: { startDatetime: 'desc' },
            take: 20,
          },
        }),
      },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return client;
  }

  /**
   * Cria um novo cliente
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados do cliente
   * @returns {Object} Cliente criado
   */
  async createClient(salonId, data) {
    const { name, email, phone, cpf, birthdate, notes } = data;

    // Validações
    if (!name || !phone) {
      throw new ValidationError('Nome e telefone são obrigatórios');
    }

    // Verificar se telefone já existe (opcional, pode ter clientes duplicados)
    // Apenas aviso, não bloqueia

    const client = await prisma.client.create({
      data: {
        salonId: salonId,
        name: name.trim(),
        email: email?.trim().toLowerCase(),
        phone: phone.trim(),
        cpf: cpf?.trim(),
        birthdate: birthdate ? new Date(birthdate) : null,
        notes: notes?.trim(),
        active: true,
      },
    });

    return client;
  }

  /**
   * Atualiza um cliente
   * @param {Number} clientId - ID do cliente
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Cliente atualizado
   */
  async updateClient(clientId, salonId, data) {
    const { name, email, phone, cpf, birthdate, notes, active } = data;

    // Verificar se cliente existe no salão
    await this.getClientById(clientId, salonId);

    // Garantir que o cliente pertence ao salão antes de atualizar
    const client = await prisma.client.update({
      where: {
        id: clientId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim().toLowerCase() }),
        ...(phone && { phone: phone.trim() }),
        ...(cpf !== undefined && { cpf: cpf?.trim() }),
        ...(birthdate !== undefined && { birthdate: birthdate ? new Date(birthdate) : null }),
        ...(notes !== undefined && { notes: notes?.trim() }),
        ...(active !== undefined && { active }),
      },
    });

    return client;
  }

  /**
   * Desativa um cliente (soft delete)
   * @param {Number} clientId - ID do cliente
   * @param {Number} salonId - ID do salão
   * @returns {Object} Cliente desativado
   */
  async deactivateClient(clientId, salonId) {
    return await this.updateClient(clientId, salonId, { active: false });
  }

  /**
   * Busca cliente por telefone
   * @param {String} phone - Telefone do cliente
   * @param {Number} salonId - ID do salão
   * @returns {Array} Clientes encontrados
   */
  async searchByPhone(phone, salonId) {
    const clients = await prisma.client.findMany({
      where: {
        salonId: salonId,
        phone: { contains: phone.trim() },
        active: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
      take: 10,
    });

    return clients;
  }
}

module.exports = new ClientService();

