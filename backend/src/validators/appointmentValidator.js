const { z } = require('zod');

const createAppointmentSchema = z.object({
  clientId: z.number().int().positive('Cliente é obrigatório'),
  professionalId: z.number().int().positive('Profissional é obrigatório'),
  serviceId: z.number().int().positive('Serviço é obrigatório'),
  startDatetime: z.string().datetime('Data/hora inicial inválida'),
  endDatetime: z.string().datetime('Data/hora final inválida').optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED']).optional(),
  paid: z.boolean().optional(),
  paymentMethod: z.enum(['PIX', 'CARD', 'CASH']).nullable().optional(),
}).refine((data) => {
  // Se paid é true, paymentMethod deve estar preenchido (não null e não undefined)
  if (data.paid === true && (!data.paymentMethod || data.paymentMethod === null)) {
    return false;
  }
  return true;
}, {
  message: 'Forma de pagamento é obrigatória quando o pagamento está marcado como pago',
  path: ['paymentMethod'],
});

const updateAppointmentSchema = z.object({
  clientId: z.number().int().positive().optional(),
  professionalId: z.number().int().positive().optional(),
  serviceId: z.number().int().positive().optional(),
  startDatetime: z.string().datetime().optional(),
  endDatetime: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED']).optional(),
  paid: z.boolean().optional(),
  paymentMethod: z.enum(['PIX', 'CARD', 'CASH']).nullable().optional(),
}).refine((data) => {
  // Se paid é true, paymentMethod deve estar preenchido (não null e não undefined)
  if (data.paid === true && (!data.paymentMethod || data.paymentMethod === null)) {
    return false;
  }
  return true;
}, {
  message: 'Forma de pagamento é obrigatória quando o pagamento está marcado como pago',
  path: ['paymentMethod'],
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED'], {
    required_error: 'Status é obrigatório',
  }),
});

const listAppointmentsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  professionalId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED']).optional(),
});

function validateCreateAppointment(data) {
  return createAppointmentSchema.parse(data);
}

function validateUpdateAppointment(data) {
  return updateAppointmentSchema.parse(data);
}

function validateUpdateStatus(data) {
  return updateStatusSchema.parse(data);
}

function validateListAppointments(data) {
  return listAppointmentsSchema.parse(data);
}

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointment,
  validateUpdateStatus,
  validateListAppointments,
};

