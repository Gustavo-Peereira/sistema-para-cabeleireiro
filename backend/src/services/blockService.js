const prisma = require('../config/database');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { validateDateRange } = require('../utils/validators');
const { addTenantFilter } = require('../middlewares/tenant');

class BlockService {
  /**
   * Lista bloqueios do salão
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {Object} filters - Filtros (from, to, professionalId)
   * @returns {Array} Lista de bloqueios
   */
  async listBlocks(salonId, userId, userRole, filters = {}) {
    const { from, to, professionalId } = filters;

    const where = addTenantFilter(salonId, {
      // PROFESSIONAL só vê próprios bloqueios
      ...(userRole === 'PROFESSIONAL' && { professionalId: userId }),
      // Se filtrou por profissional específico
      ...(professionalId && { professionalId: parseInt(professionalId) }),
      // Filtro de data
      ...(from && to && {
        OR: [
          {
            startDatetime: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
          {
            endDatetime: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
          {
            AND: [
              { startDatetime: { lte: new Date(from) } },
              { endDatetime: { gte: new Date(to) } },
            ],
          },
        ],
      }),
    });

    const blocks = await prisma.block.findMany({
      where,
      include: {
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startDatetime: 'asc' },
    });

    return blocks;
  }

  /**
   * Busca um bloqueio por ID
   * @param {Number} blockId - ID do bloqueio
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do bloqueio
   */
  async getBlockById(blockId, salonId) {
    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        salonId: salonId,
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!block) {
      throw new NotFoundError('Bloqueio não encontrado');
    }

    return block;
  }

  /**
   * Cria um novo bloqueio
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {Object} data - Dados do bloqueio
   * @returns {Object} Bloqueio criado
   */
  async createBlock(salonId, userId, userRole, data) {
    const { professionalId, startDatetime, endDatetime, reason } = data;

    // Validações
    if (!professionalId || !startDatetime || !endDatetime) {
      throw new ValidationError('Profissional, data/hora inicial e final são obrigatórios');
    }

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    validateDateRange(start, end);

    // PROFESSIONAL só pode criar bloqueio para si mesmo
    if (userRole === 'PROFESSIONAL' && parseInt(professionalId) !== userId) {
      throw new ForbiddenError('Você só pode criar bloqueios para si mesmo');
    }

    // Verificar se profissional existe e pertence ao salão
    const professional = await prisma.user.findFirst({
      where: {
        id: parseInt(professionalId),
        salonId: salonId,
      },
    });

    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    // Verificar conflito com outros bloqueios
    const conflictingBlocks = await this.checkBlockConflict(
      salonId,
      parseInt(professionalId),
      start,
      end
    );

    if (conflictingBlocks.length > 0) {
      throw new ValidationError('Já existe um bloqueio neste horário para este profissional');
    }

    // Verificar conflito com agendamentos
    const conflictingAppointments = await this.checkAppointmentConflict(
      salonId,
      parseInt(professionalId),
      start,
      end
    );

    if (conflictingAppointments.length > 0) {
      throw new ValidationError(
        `Existem ${conflictingAppointments.length} agendamento(s) confirmado(s) neste horário. Cancele os agendamentos antes de criar o bloqueio.`
      );
    }

    // Criar bloqueio
    const block = await prisma.block.create({
      data: {
        salonId: salonId,
        professionalId: parseInt(professionalId),
        startDatetime: start,
        endDatetime: end,
        reason: reason?.trim(),
      },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return block;
  }

  /**
   * Remove um bloqueio
   * @param {Number} blockId - ID do bloqueio
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @returns {Object} Bloqueio removido
   */
  async deleteBlock(blockId, salonId, userId, userRole) {
    const block = await this.getBlockById(blockId, salonId);

    // PROFESSIONAL só pode remover próprios bloqueios
    if (userRole === 'PROFESSIONAL' && block.professionalId !== userId) {
      throw new ForbiddenError('Você só pode remover seus próprios bloqueios');
    }

    // Garantir que o bloqueio pertence ao salão antes de deletar
    await prisma.block.delete({
      where: {
        id: blockId,
        salonId: salonId, // Garantir que pertence ao salão
      },
    });

    return block;
  }

  /**
   * Verifica conflito de bloqueios
   * @private
   */
  async checkBlockConflict(salonId, professionalId, start, end, excludeBlockId = null) {
    return await prisma.block.findMany({
      where: {
        salonId: salonId,
        professionalId: professionalId,
        ...(excludeBlockId && { NOT: { id: excludeBlockId } }),
        OR: [
          // Novo bloqueio começa durante bloqueio existente
          {
            AND: [
              { startDatetime: { lte: start } },
              { endDatetime: { gt: start } },
            ],
          },
          // Novo bloqueio termina durante bloqueio existente
          {
            AND: [
              { startDatetime: { lt: end } },
              { endDatetime: { gte: end } },
            ],
          },
          // Novo bloqueio engloba bloqueio existente
          {
            AND: [
              { startDatetime: { gte: start } },
              { endDatetime: { lte: end } },
            ],
          },
        ],
      },
    });
  }

  /**
   * Verifica conflito com agendamentos
   * @private
   */
  async checkAppointmentConflict(salonId, professionalId, start, end, excludeAppointmentId = null) {
    return await prisma.appointment.findMany({
      where: {
        salonId: salonId,
        professionalId: professionalId,
        status: { notIn: ['CANCELED'] },
        ...(excludeAppointmentId && { NOT: { id: excludeAppointmentId } }),
        OR: [
          {
            AND: [
              { startDatetime: { lt: end } },
              { endDatetime: { gt: start } },
            ],
          },
        ],
      },
    });
  }
}

module.exports = new BlockService();

