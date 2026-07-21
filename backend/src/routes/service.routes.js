const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin, isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);

/**
 * GET /api/services
 * Lista todos os serviços (todos podem ver)
 */
router.get('/', isAuthenticated, serviceController.listServices.bind(serviceController));

/**
 * GET /api/services/:id
 * Busca um serviço por ID (todos podem ver)
 */
router.get('/:id', isAuthenticated, serviceController.getServiceById.bind(serviceController));

/**
 * POST /api/services
 * Cria um novo serviço (apenas ADMIN)
 */
router.post('/', isAdmin, serviceController.createService.bind(serviceController));

/**
 * PUT /api/services/:id
 * Atualiza um serviço (apenas ADMIN)
 */
router.put('/:id', isAdmin, serviceController.updateService.bind(serviceController));

/**
 * DELETE /api/services/:id
 * Remove um serviço (apenas ADMIN)
 */
router.delete('/:id', isAdmin, serviceController.deleteService.bind(serviceController));

module.exports = router;

