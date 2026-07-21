const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin, isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);

/**
 * GET /api/users/professionals
 * Lista apenas profissionais ativos (todos podem acessar)
 */
router.get('/professionals', isAuthenticated, userController.listProfessionals.bind(userController));

/**
 * GET /api/users
 * Lista todos os usuários (apenas ADMIN)
 */
router.get('/', isAdmin, userController.listUsers.bind(userController));

/**
 * GET /api/users/:id
 * Busca um usuário por ID (apenas ADMIN)
 */
router.get('/:id', isAdmin, userController.getUserById.bind(userController));

/**
 * POST /api/users
 * Cria um novo usuário (apenas ADMIN)
 */
router.post('/', isAdmin, userController.createUser.bind(userController));

/**
 * PUT /api/users/:id
 * Atualiza um usuário (apenas ADMIN)
 */
router.put('/:id', isAdmin, userController.updateUser.bind(userController));

/**
 * PATCH /api/users/:id/active
 * Ativa ou desativa um usuário (apenas ADMIN)
 */
router.patch('/:id/active', isAdmin, userController.toggleUserActive.bind(userController));

/**
 * GET /api/users/me
 * Retorna dados do próprio usuário
 */
router.get('/me/profile', isAuthenticated, userController.getMyProfile.bind(userController));

/**
 * PUT /api/users/me
 * Atualiza dados do próprio usuário
 */
router.put('/me', isAuthenticated, userController.updateMyProfile.bind(userController));

module.exports = router;

