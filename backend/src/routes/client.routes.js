const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middlewares/auth');
const { isAuthenticated } = require('../middlewares/rbac');
const { ensureTenant } = require('../middlewares/tenant');

// Todas as rotas requerem autenticação
router.use(authenticate);
router.use(ensureTenant);
router.use(isAuthenticated); // ADMIN e PROFESSIONAL podem gerenciar clientes

/**
 * GET /api/clients/search-phone?phone=123
 * Busca clientes por telefone
 */
router.get('/search-phone', clientController.searchByPhone.bind(clientController));

/**
 * GET /api/clients
 * Lista todos os clientes
 */
router.get('/', clientController.listClients.bind(clientController));

/**
 * GET /api/clients/:id
 * Busca um cliente por ID
 */
router.get('/:id', clientController.getClientById.bind(clientController));

/**
 * POST /api/clients
 * Cria um novo cliente
 */
router.post('/', clientController.createClient.bind(clientController));

/**
 * PUT /api/clients/:id
 * Atualiza um cliente
 */
router.put('/:id', clientController.updateClient.bind(clientController));

/**
 * DELETE /api/clients/:id
 * Desativa um cliente (soft delete)
 */
router.delete('/:id', clientController.deleteClient.bind(clientController));

module.exports = router;

