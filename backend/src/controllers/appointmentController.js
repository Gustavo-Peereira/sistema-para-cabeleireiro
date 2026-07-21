const appointmentService = require('../services/appointmentService');
const {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateUpdateStatus,
  validateListAppointments,
} = require('../validators/appointmentValidator');
const { ValidationError } = require('../utils/errors');

class AppointmentController {
  /**
   * GET /api/appointments
   * Lista agendamentos
   */
  async listAppointments(req, res, next) {
    try {
      // Validar query params
      const validatedQuery = validateListAppointments(req.query);
      
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const filters = {
        ...(validatedQuery.from && { from: validatedQuery.from }),
        ...(validatedQuery.to && { to: validatedQuery.to }),
        ...(validatedQuery.professionalId && { professionalId: validatedQuery.professionalId }),
        ...(validatedQuery.clientId && { clientId: validatedQuery.clientId }),
        ...(validatedQuery.status && { status: validatedQuery.status }),
      };

      const appointments = await appointmentService.listAppointments(
        salonId,
        userId,
        userRole,
        filters
      );

      return res.json({
        success: true,
        data: appointments,
        total: appointments.length,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * GET /api/appointments/:id
   * Busca um agendamento por ID
   */
  async getAppointmentById(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id);
      const salonId = req.salonId;

      const appointment = await appointmentService.getAppointmentById(appointmentId, salonId);

      return res.json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/appointments
   * Cria um novo agendamento
   */
  async createAppointment(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateCreateAppointment(req.body);
      
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const appointment = await appointmentService.createAppointment(
        salonId,
        userId,
        userRole,
        validatedData
      );

      return res.status(201).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        data: appointment,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * PUT /api/appointments/:id
   * Atualiza um agendamento
   */
  async updateAppointment(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateUpdateAppointment(req.body);
      
      const appointmentId = parseInt(req.params.id);
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const appointment = await appointmentService.updateAppointment(
        appointmentId,
        salonId,
        userId,
        userRole,
        validatedData
      );

      return res.json({
        success: true,
        message: 'Agendamento atualizado com sucesso',
        data: appointment,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * PATCH /api/appointments/:id/status
   * Atualiza status de um agendamento
   */
  async updateAppointmentStatus(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateUpdateStatus(req.body);
      
      const appointmentId = parseInt(req.params.id);
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const appointment = await appointmentService.updateAppointmentStatus(
        appointmentId,
        salonId,
        userId,
        userRole,
        validatedData.status
      );

      return res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: appointment,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * DELETE /api/appointments/:id
   * Cancela um agendamento
   */
  async cancelAppointment(req, res, next) {
    try {
      const appointmentId = parseInt(req.params.id);
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const appointment = await appointmentService.cancelAppointment(
        appointmentId,
        salonId,
        userId,
        userRole
      );

      return res.json({
        success: true,
        message: 'Agendamento cancelado com sucesso',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();

