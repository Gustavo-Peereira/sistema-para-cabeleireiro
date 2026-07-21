const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e injeta os dados do usuário na requisição
 */
function authenticate(req, res, next) {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token não fornecido');
    }

    // Formato esperado: "Bearer {token}"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer {token}');
    }

    const token = parts[1];

    // Verificar e decodificar token
    const decoded = verifyToken(token);

    // Injetar dados do usuário na requisição
    req.user = {
      id: decoded.userId,
      salonId: decoded.salonId,
      role: decoded.role,
    };

    // Atalho para salonId (usado frequentemente)
    req.salonId = decoded.salonId;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }
}

/**
 * Middleware opcional de autenticação
 * Se houver token, valida e injeta dados, senão continua
 */
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  return authenticate(req, res, next);
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};



