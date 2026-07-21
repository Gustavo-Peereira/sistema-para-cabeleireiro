/**
 * Helpers para manipulação de datas
 */
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data e hora para exibição
 * @param {string|Date} date - Data a ser formatada
 * @param {string} formatString - Formato desejado
 * @returns {string} Data formatada
 */
export const formatDateTime = (date, formatString = "dd/MM/yyyy 'às' HH:mm") => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Formata apenas a data
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (ex: "04/02/2026")
 */
export const formatDate = (date) => {
  return formatDateTime(date, 'dd/MM/yyyy');
};

/**
 * Formata apenas a hora
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Hora formatada (ex: "14:30")
 */
export const formatTime = (date) => {
  return formatDateTime(date, 'HH:mm');
};

/**
 * Formata data por extenso
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada (ex: "4 de fevereiro de 2026")
 */
export const formatDateLong = (date) => {
  return formatDateTime(date, "d 'de' MMMM 'de' yyyy");
};

/**
 * Formata dia da semana
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Dia da semana (ex: "Terça-feira")
 */
export const formatWeekday = (date) => {
  return formatDateTime(date, 'EEEE');
};



