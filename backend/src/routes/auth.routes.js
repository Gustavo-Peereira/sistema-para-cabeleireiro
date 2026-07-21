const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

/**
 * POST /api/auth/login
 * Login de usuário (público)
 */
router.post('/login', authController.login.bind(authController));

/**
 * GET /api/auth/me
 * Retorna dados do usuário logado (requer autenticação)
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

/**
 * POST /api/auth/change-password
 * Altera senha do usuário (requer autenticação)
 */
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

module.exports = router;

