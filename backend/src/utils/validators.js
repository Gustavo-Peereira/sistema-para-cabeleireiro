/**
 * Helpers para validações comuns
 */
const { ValidationError } = require('./errors');

/**
 * Valida se a data final é posterior à data inicial
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @throws {ValidationError} Se a validação falhar
 */
const validateDateRange = (startDate, endDate) => {
  if (endDate <= startDate) {
    throw new ValidationError('Data/hora final deve ser posterior à inicial');
  }
};

/**
 * Valida se um email tem formato válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se uma senha atende aos requisitos mínimos
 * @param {string} password - Senha a ser validada
 * @throws {ValidationError} Se a validação falhar
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new ValidationError('A senha deve ter no mínimo 6 caracteres');
  }
};

/**
 * Valida se um valor numérico é positivo
 * @param {number} value - Valor a ser validado
 * @param {string} fieldName - Nome do campo (para mensagem de erro)
 * @throws {ValidationError} Se a validação falhar
 */
const validatePositiveNumber = (value, fieldName = 'Valor') => {
  if (value !== undefined && value < 0) {
    throw new ValidationError(`${fieldName} não pode ser negativo`);
  }
};

/**
 * Valida se uma duração é válida
 * @param {number} duration - Duração em minutos
 * @throws {ValidationError} Se a validação falhar
 */
const validateDuration = (duration) => {
  if (duration !== undefined && duration <= 0) {
    throw new ValidationError('Duração deve ser maior que zero');
  }
};

/**
 * Sanitiza string removendo espaços extras
 * @param {string} str - String a ser sanitizada
 * @returns {string|null} String sanitizada ou null
 */
const sanitizeString = (str) => {
  return str ? str.trim() : null;
};

module.exports = {
  validateDateRange,
  isValidEmail,
  validatePassword,
  validatePositiveNumber,
  validateDuration,
  sanitizeString,
};



