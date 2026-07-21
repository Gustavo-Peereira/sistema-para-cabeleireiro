const { z } = require('zod');

const createBlockSchema = z.object({
  professionalId: z.number().int().positive('Profissional é obrigatório'),
  startDatetime: z.string().datetime('Data/hora inicial inválida'),
  endDatetime: z.string().datetime('Data/hora final inválida'),
  reason: z.string().max(255).optional().or(z.literal('')),
});

function validateCreateBlock(data) {
  return createBlockSchema.parse(data);
}

module.exports = {
  validateCreateBlock,
};



