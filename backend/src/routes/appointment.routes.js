const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);
router.use(isAuthenticated); // ADMIN e PROFESSIONAL

/**
 * GET /api/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&professionalId=X&clientId=X&status=X
 * Lista agendamentos
 */
router.get('/', appointmentController.listAppointments.bind(appointmentController));

/**
 * GET /api/appointments/:id
 * Busca um agendamento por ID
 */
router.get('/:id', appointmentController.getAppointmentById.bind(appointmentController));

/**
 * POST /api/appointments
 * Cria um novo agendamento
 */
router.post('/', appointmentController.createAppointment.bind(appointmentController));

/**
 * PUT /api/appointments/:id
 * Atualiza um agendamento
 */
router.put('/:id', appointmentController.updateAppointment.bind(appointmentController));

/**
 * PATCH /api/appointments/:id/status
 * Atualiza status de um agendamento
 */
router.patch('/:id/status', appointmentController.updateAppointmentStatus.bind(appointmentController));

/**
 * DELETE /api/appointments/:id
 * Cancela um agendamento
 */
router.delete('/:id', appointmentController.cancelAppointment.bind(appointmentController));

module.exports = router;

