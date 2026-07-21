const { z } = require('zod');

const createClientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  email: z.string().email('Email inválido').max(100).optional().or(z.literal('')),
  cpf: z.string().max(14).optional().or(z.literal('')),
  birthdate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const updateClientSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  cpf: z.string().max(14).optional().or(z.literal('')),
  birthdate: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  active: z.boolean().optional(),
});

function validateCreateClient(data) {
  return createClientSchema.parse(data);
}

function validateUpdateClient(data) {
  return updateClientSchema.parse(data);
}

module.exports = {
  validateCreateClient,
  validateUpdateClient,
};



