const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin, isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);

/**
 * GET /api/salon
 * Retorna dados do salão (qualquer usuário autenticado)
 */
router.get('/', isAuthenticated, salonController.getSalon.bind(salonController));

/**
 * PUT /api/salon
 * Atualiza dados do salão (apenas ADMIN)
 */
router.put('/', isAdmin, salonController.updateSalon.bind(salonController));

module.exports = router;

