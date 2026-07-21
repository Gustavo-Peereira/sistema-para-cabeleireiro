/**
 * Helpers para manipulação de status de agendamentos
 */

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  DONE: 'DONE',
  NO_SHOW: 'NO_SHOW',
  CANCELED: 'CANCELED',
};

export const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    DONE: 'success',
    NO_SHOW: 'error',
    CANCELED: 'default',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    DONE: 'Concluído',
    NO_SHOW: 'Não Compareceu',
    CANCELED: 'Cancelado',
  };
  return labels[status] || status;
};

export const getPaymentMethodLabel = (method) => {
  const labels = {
    PIX: 'PIX',
    CARD: 'Cartão',
    CASH: 'Dinheiro',
  };
  return labels[method] || method;
};



