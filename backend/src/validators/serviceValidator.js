const { z } = require('zod');

const createServiceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  duration: z.number().int().min(1, 'Duração deve ser maior que 0'),
  price: z.number().min(0, 'Preço não pode ser negativo'),
});

const updateServiceSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
  duration: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

function validateCreateService(data) {
  return createServiceSchema.parse(data);
}

function validateUpdateService(data) {
  return updateServiceSchema.parse(data);
}

module.exports = {
  validateCreateService,
  validateUpdateService,
};



