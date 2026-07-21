const prisma = require('../config/database');
const { NotFoundError, ValidationError, ForbiddenError, ConflictError } = require('../utils/errors');
const { addTenantFilter } = require('../middlewares/tenant');
const { validateDateRange } = require('../utils/validators');
const { calculateEndDatetime } = require('../utils/dateHelpers');

class AppointmentService {
  /**
   * Lista agendamentos do salão
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {Object} filters - Filtros (from, to, professionalId, clientId, status)
   * @returns {Array} Lista de agendamentos
   */
  async listAppointments(salonId, userId, userRole, filters = {}) {
    const { from, to, professionalId, clientId, status } = filters;

    const where = addTenantFilter(salonId, {
      // PROFESSIONAL só vê próprios agendamentos
      ...(userRole === 'PROFESSIONAL' && { professionalId: userId }),
      // Filtros opcionais
      ...(professionalId && { professionalId: parseInt(professionalId) }),
      ...(clientId && { clientId: parseInt(clientId) }),
      ...(status && { status }),
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

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: { startDatetime: 'asc' },
    });

    return appointments;
  }

  /**
   * Busca um agendamento por ID
   * @param {Number} appointmentId - ID do agendamento
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do agendamento
   */
  async getAppointmentById(appointmentId, salonId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        salonId: salonId,
      },
      include: {
        client: true,
        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    return appointment;
  }

  /**
   * Cria um novo agendamento
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {Object} data - Dados do agendamento
   * @returns {Object} Agendamento criado
   */
  async createAppointment(salonId, userId, userRole, data) {
    const { clientId, professionalId, serviceId, startDatetime, endDatetime, notes, status, paid, paymentMethod } = data;

    // Validações
    if (!clientId || !professionalId || !serviceId || !startDatetime) {
      throw new ValidationError('Cliente, profissional, serviço e data/hora são obrigatórios');
    }

    // PROFESSIONAL só pode criar agendamento para si mesmo
    if (userRole === 'PROFESSIONAL' && parseInt(professionalId) !== userId) {
      throw new ForbiddenError('Você só pode criar agendamentos para si mesmo');
    }

    // Buscar serviço para calcular duração
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(serviceId),
        salonId: salonId,
        active: true,
      },
    });

    if (!service) {
      throw new NotFoundError('Serviço não encontrado ou inativo');
    }

    // Calcular end_datetime baseado na duração do serviço (se não fornecido)
    const start = new Date(startDatetime);
    const end = endDatetime ? new Date(endDatetime) : calculateEndDatetime(start, service.duration);

    validateDateRange(start, end);

    // Verificar se cliente existe e pertence ao salão
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(clientId),
        salonId: salonId,
        active: true,
      },
    });

    if (!client) {
      throw new NotFoundError('Cliente não encontrado ou inativo');
    }

    // Verificar se profissional existe e pertence ao salão
    const professional = await prisma.user.findFirst({
      where: {
        id: parseInt(professionalId),
        salonId: salonId,
        active: true,
      },
    });

    if (!professional) {
      throw new NotFoundError('Profissional não encontrado ou inativo');
    }

    // ====== REGRA DE CONFLITO (CRÍTICA) ======
    await this.checkScheduleConflict(
      salonId,
      parseInt(professionalId),
      start,
      end
    );

    // Criar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        salonId: salonId,
        clientId: parseInt(clientId),
        professionalId: parseInt(professionalId),
        serviceId: parseInt(serviceId),
        startDatetime: start,
        endDatetime: end,
        status: status || 'PENDING',
        paid: paid || false,
        // Só definir paymentMethod se paid for true
        paymentMethod: (paid && paymentMethod) ? paymentMethod : null,
        notes: notes?.trim(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return appointment;
  }

  /**
   * Atualiza um agendamento
   * @param {Number} appointmentId - ID do agendamento
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Agendamento atualizado
   */
  async updateAppointment(appointmentId, salonId, userId, userRole, data) {
    const { clientId, professionalId, serviceId, startDatetime, endDatetime, notes, status, paid, paymentMethod } = data;

    // Buscar agendamento existente
    const existingAppointment = await this.getAppointmentById(appointmentId, salonId);

    // PROFESSIONAL só pode editar próprios agendamentos
    if (userRole === 'PROFESSIONAL' && existingAppointment.professionalId !== userId) {
      throw new ForbiddenError('Você só pode editar seus próprios agendamentos');
    }

    // Preparar dados de atualização
    const updateData = {};

    // Se está mudando cliente
    if (clientId && parseInt(clientId) !== existingAppointment.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: parseInt(clientId),
          salonId: salonId,
          active: true,
        },
      });

      if (!client) {
        throw new NotFoundError('Cliente não encontrado ou inativo');
      }

      updateData.clientId = parseInt(clientId);
    }

    // Se está mudando profissional
    if (professionalId && parseInt(professionalId) !== existingAppointment.professionalId) {
      if (userRole === 'PROFESSIONAL') {
        throw new ForbiddenError('Você não pode transferir agendamentos para outros profissionais');
      }

      const professional = await prisma.user.findFirst({
        where: {
          id: parseInt(professionalId),
          salonId: salonId,
          active: true,
        },
      });

      if (!professional) {
        throw new NotFoundError('Profissional não encontrado ou inativo');
      }

      updateData.professionalId = parseInt(professionalId);
    }

    // Se está mudando serviço
    if (serviceId && parseInt(serviceId) !== existingAppointment.serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: parseInt(serviceId),
          salonId: salonId,
          active: true,
        },
      });

      if (!service) {
        throw new NotFoundError('Serviço não encontrado ou inativo');
      }

      updateData.serviceId = parseInt(serviceId);

      // Recalcular end_datetime se necessário
      if (!endDatetime) {
        const start = startDatetime ? new Date(startDatetime) : existingAppointment.startDatetime;
        updateData.endDatetime = addMinutes(start, service.duration);
      }
    }

    // Se está mudando horário
    if (startDatetime || endDatetime) {
      const start = startDatetime ? new Date(startDatetime) : existingAppointment.startDatetime;
      const end = endDatetime ? new Date(endDatetime) : existingAppointment.endDatetime;

      validateDateRange(start, end);

      updateData.startDatetime = start;
      updateData.endDatetime = end;

      // Verificar conflito (excluindo o próprio agendamento)
      const finalProfessionalId = updateData.professionalId || existingAppointment.professionalId;

      await this.checkScheduleConflict(
        salonId,
        finalProfessionalId,
        start,
        end,
        appointmentId
      );
    }

    // Outros campos
    if (notes !== undefined) updateData.notes = notes?.trim();
    if (status) updateData.status = status;
    if (paid !== undefined) {
      updateData.paid = paid;
      // Se marcado como não pago, limpar paymentMethod
      if (!paid) {
        updateData.paymentMethod = null;
      }
    }
    if (paymentMethod !== undefined) {
      // Só atualizar paymentMethod se paid for true
      const finalPaid = paid !== undefined ? paid : existingAppointment.paid;
      if (finalPaid) {
        updateData.paymentMethod = paymentMethod || null;
      } else {
        updateData.paymentMethod = null;
      }
    }

    // Atualizar agendamento garantindo que pertence ao salão
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return appointment;
  }

  /**
   * Atualiza status de um agendamento
   * @param {Number} appointmentId - ID do agendamento
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @param {String} status - Novo status
   * @returns {Object} Agendamento atualizado
   */
  async updateAppointmentStatus(appointmentId, salonId, userId, userRole, status) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED'];

    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status inválido. Use: ${validStatuses.join(', ')}`);
    }

    const existingAppointment = await this.getAppointmentById(appointmentId, salonId);

    // PROFESSIONAL só pode alterar status dos próprios agendamentos
    if (userRole === 'PROFESSIONAL' && existingAppointment.professionalId !== userId) {
      throw new ForbiddenError('Você só pode alterar status dos seus próprios agendamentos');
    }

    // Garantir que o agendamento pertence ao salão antes de atualizar
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
        salonId: salonId, // Garantir que pertence ao salão
      },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    return appointment;
  }

  /**
   * Cancela um agendamento
   * @param {Number} appointmentId - ID do agendamento
   * @param {Number} salonId - ID do salão
   * @param {Number} userId - ID do usuário logado
   * @param {String} userRole - Role do usuário
   * @returns {Object} Agendamento cancelado
   */
  async cancelAppointment(appointmentId, salonId, userId, userRole) {
    return await this.updateAppointmentStatus(appointmentId, salonId, userId, userRole, 'CANCELED');
  }

  /**
   * Verifica conflito de horário
   * @private
   * @param {Number} salonId - ID do salão
   * @param {Number} professionalId - ID do profissional
   * @param {Date} start - Data/hora inicial
   * @param {Date} end - Data/hora final
   * @param {Number} excludeAppointmentId - ID do agendamento a excluir da verificação
   */
  async checkScheduleConflict(salonId, professionalId, start, end, excludeAppointmentId = null) {
    // Verificar conflito com outros agendamentos
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        salonId: salonId,
        professionalId: professionalId,
        status: { notIn: ['CANCELED'] },
        ...(excludeAppointmentId && { NOT: { id: excludeAppointmentId } }),
        // Regra: start < existente.end AND end > existente.start
        AND: [
          { startDatetime: { lt: end } },
          { endDatetime: { gt: start } },
        ],
      },
      include: {
        service: {
          select: { name: true },
        },
      },
    });

    if (conflictingAppointments.length > 0) {
      const conflict = conflictingAppointments[0];
      throw new ConflictError(
        `Conflito de horário! Já existe um agendamento (${conflict.service.name}) das ${conflict.startDatetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${conflict.endDatetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      );
    }

    // Verificar conflito com bloqueios
    const conflictingBlocks = await prisma.block.findMany({
      where: {
        salonId: salonId,
        professionalId: professionalId,
        AND: [
          { startDatetime: { lt: end } },
          { endDatetime: { gt: start } },
        ],
      },
    });

    if (conflictingBlocks.length > 0) {
      const block = conflictingBlocks[0];
      throw new ConflictError(
        `Horário bloqueado! Existe um bloqueio das ${block.startDatetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${block.endDatetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${block.reason ? ` (${block.reason})` : ''}`
      );
    }
  }

  /**
   * Busca horários disponíveis para um profissional
   * @param {Number} salonId - ID do salão
   * @param {Number} professionalId - ID do profissional
   * @param {String} date - Data no formato YYYY-MM-DD
   * @param {Number} duration - Duração em minutos
   * @returns {Array} Lista de horários disponíveis
   */
  async getAvailableSlots(salonId, professionalId, date, duration) {
    // Esta função pode ser implementada futuramente para sugerir horários livres
    // Por enquanto retorna array vazio
    return [];
  }
}

module.exports = new AppointmentService();

