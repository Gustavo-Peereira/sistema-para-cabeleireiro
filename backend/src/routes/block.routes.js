const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const { authenticate } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);
router.use(isAuthenticated); // ADMIN e PROFESSIONAL

/**
 * GET /api/blocks?from=YYYY-MM-DD&to=YYYY-MM-DD&professionalId=X
 * Lista bloqueios
 */
router.get('/', blockController.listBlocks.bind(blockController));

/**
 * GET /api/blocks/:id
 * Busca um bloqueio por ID
 */
router.get('/:id', blockController.getBlockById.bind(blockController));

/**
 * POST /api/blocks
 * Cria um novo bloqueio
 */
router.post('/', blockController.createBlock.bind(blockController));

/**
 * DELETE /api/blocks/:id
 * Remove um bloqueio
 */
router.delete('/:id', blockController.deleteBlock.bind(blockController));

module.exports = router;

