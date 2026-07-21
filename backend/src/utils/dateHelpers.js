/**
 * Helpers para manipulação de datas no backend
 */
const { parseISO, addMinutes } = require('date-fns');

/**
 * Calcula a data/hora final baseada na inicial + duração
 * @param {Date|string} startDatetime - Data/hora inicial
 * @param {number} durationMinutes - Duração em minutos
 * @returns {Date} Data/hora final
 */
const calculateEndDatetime = (startDatetime, durationMinutes) => {
  const start = typeof startDatetime === 'string' ? parseISO(startDatetime) : startDatetime;
  return addMinutes(start, durationMinutes);
};

/**
 * Verifica se duas datas se sobrepõem
 * @param {Date} start1 - Início do primeiro período
 * @param {Date} end1 - Fim do primeiro período
 * @param {Date} start2 - Início do segundo período
 * @param {Date} end2 - Fim do segundo período
 * @returns {boolean} True se há sobreposição
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

module.exports = {
  calculateEndDatetime,
  hasTimeOverlap,
};



