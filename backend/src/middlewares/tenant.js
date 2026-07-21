/**
 * Middleware para garantir que todas as queries filtrem por salon_id
 * Este middleware injeta o salonId nas queries automaticamente
 * 
 * IMPORTANTE: Este é um middleware informativo.
 * A validação real deve ser feita nos services/controllers
 */
function ensureTenant(req, res, next) {
  if (!req.salonId) {
    return res.status(401).json({
      error: 'Salon ID não identificado. Faça login novamente',
    });
  }

  // Adiciona salonId ao body para facilitar uso nos controllers
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (req.body && typeof req.body === 'object') {
      req.body.salonId = req.salonId;
    }
  }

  next();
}

/**
 * Helper para adicionar filtro de tenant em queries
 * @param {Number} salonId - ID do salão
 * @param {Object} where - Objeto where do Prisma
 * @returns {Object} Where com salonId adicionado
 */
function addTenantFilter(salonId, where = {}) {
  return {
    ...where,
    salonId: salonId,
  };
}

module.exports = {
  ensureTenant,
  addTenantFilter,
};



