/**
 * Helpers para formatação de dados
 */

/**
 * Formata preço para exibição
 * @param {number|string} price - Preço a ser formatado
 * @returns {string} Preço formatado (ex: "R$ 50,00")
 */
export const formatPrice = (price) => {
  const numericPrice = parseFloat(price || 0);
  return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
};

/**
 * Formata telefone no padrão brasileiro
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formata duração em minutos para exibição
 * @param {number} minutes - Duração em minutos
 * @returns {string} Duração formatada (ex: "1h 30min")
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  }
  
  if (hours > 0) {
    return `${hours}h`;
  }
  
  return `${mins} min`;
};



