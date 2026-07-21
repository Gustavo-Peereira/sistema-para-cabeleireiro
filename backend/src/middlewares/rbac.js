const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware de autorização por role
 * @param {Array<String>} allowedRoles - Array de roles permitidas (ex: ['ADMIN'])
 * @returns {Function} Middleware function
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acesso negado. Você não tem permissão para acessar este recurso',
        requiredRoles: allowedRoles,
        yourRole: userRole,
      });
    }

    next();
  };
}

/**
 * Middleware para verificar se é ADMIN
 */
function isAdmin(req, res, next) {
  return authorize('ADMIN')(req, res, next);
}

/**
 * Middleware para verificar se é ADMIN ou PROFESSIONAL
 */
function isAuthenticated(req, res, next) {
  return authorize('ADMIN', 'PROFESSIONAL')(req, res, next);
}

/**
 * Middleware para verificar se o usuário tem acesso ao recurso
 * ADMIN tem acesso a tudo
 * PROFESSIONAL só tem acesso aos próprios recursos
 * @param {String} resourceUserIdParam - Nome do parâmetro que contém o userId do recurso
 */
function canAccessResource(resourceUserIdParam = 'professionalId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
      });
    }

    // ADMIN tem acesso a tudo
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // PROFESSIONAL só acessa próprios recursos
    const resourceUserId = parseInt(req.params[resourceUserIdParam] || req.body[resourceUserIdParam]);

    if (!resourceUserId) {
      // Se não especificou o userId, é uma listagem geral
      // Será filtrado no controller
      return next();
    }

    if (resourceUserId !== req.user.id) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este recurso',
      });
    }

    next();
  };
}

module.exports = {
  authorize,
  isAdmin,
  isAuthenticated,
  canAccessResource,
};



