const prisma = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { addTenantFilter } = require('../middlewares/tenant');
const { validateDuration, validatePositiveNumber } = require('../utils/validators');

class ServiceService {
  /**
   * Lista todos os serviços do salão
   * @param {Number} salonId - ID do salão
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de serviços
   */
  async listServices(salonId, filters = {}) {
    const { active } = filters;

    const where = addTenantFilter(salonId, {
      ...(active !== undefined && { active }),
    });

    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { active: 'desc' },
        { name: 'asc' },
      ],
    });

    return services;
  }

  /**
   * Busca um serviço por ID
   * @param {Number} serviceId - ID do serviço
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do serviço
   */
  async getServiceById(serviceId, salonId) {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        salonId: salonId,
      },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    return service;
  }

  /**
   * Cria um novo serviço
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados do serviço
   * @returns {Object} Serviço criado
   */
  async createService(salonId, data) {
    const { name, description, duration, price } = data;

    // Validações
    if (!name || !duration || price === undefined) {
      throw new ValidationError('Nome, duração e preço são obrigatórios');
    }

    validateDuration(duration);
    validatePositiveNumber(price, 'Preço');

    const service = await prisma.service.create({
      data: {
        salonId: salonId,
        name: name.trim(),
        description: description?.trim(),
        duration: parseInt(duration),
        price: parseFloat(price),
        active: true,
      },
    });

    return service;
  }

  /**
   * Atualiza um serviço
   * @param {Number} serviceId - ID do serviço
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Serviço atualizado
   */
  async updateService(serviceId, salonId, data) {
    const { name, description, duration, price, active } = data;

    // Verificar se serviço existe no salão
    await this.getServiceById(serviceId, salonId);

    // Validações
    validateDuration(duration);
    validatePositiveNumber(price, 'Preço');

    // Garantir que o serviço pertence ao salão antes de atualizar
    const service = await prisma.service.update({
      where: {
        id: serviceId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(duration && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(active !== undefined && { active }),
      },
    });

    return service;
  }

  /**
   * Remove um serviço (soft delete)
   * @param {Number} serviceId - ID do serviço
   * @param {Number} salonId - ID do salão
   * @returns {Object} Serviço desativado
   */
  async deleteService(serviceId, salonId) {
    // Verificar se serviço existe no salão
    await this.getServiceById(serviceId, salonId);

    // Verificar se há agendamentos futuros com este serviço
    const futureAppointments = await prisma.appointment.count({
      where: {
        serviceId: serviceId,
        startDatetime: { gte: new Date() },
        status: { notIn: ['CANCELED', 'DONE'] },
      },
    });

    if (futureAppointments > 0) {
      throw new ValidationError(
        `Não é possível remover este serviço. Existem ${futureAppointments} agendamentos futuros associados a ele.`
      );
    }

    // Desativar ao invés de deletar - garantir que pertence ao salão
    const service = await prisma.service.update({
      where: {
        id: serviceId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: { active: false },
    });

    return service;
  }
}

module.exports = new ServiceService();

