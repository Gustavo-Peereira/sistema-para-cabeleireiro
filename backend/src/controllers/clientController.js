const clientService = require('../services/clientService');
const { validateCreateClient, validateUpdateClient } = require('../validators/clientValidator');
const { ValidationError } = require('../utils/errors');

class ClientController {
  /**
   * GET /api/clients
   * Lista todos os clientes do salão
   */
  async listClients(req, res, next) {
    try {
      const salonId = req.salonId;
      const { active, search, limit, offset } = req.query;

      const filters = {
        ...(active !== undefined && { active: active === 'true' }),
        ...(search && { search }),
        ...(limit && { limit }),
        ...(offset && { offset }),
      };

      const result = await clientService.listClients(salonId, filters);

      return res.json({
        success: true,
        data: result.clients,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clients/search-phone?phone=123
   * Busca clientes por telefone
   */
  async searchByPhone(req, res, next) {
    try {
      const salonId = req.salonId;
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({
          error: 'Telefone é obrigatório',
        });
      }

      const clients = await clientService.searchByPhone(phone, salonId);

      return res.json({
        success: true,
        data: clients,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/clients/:id
   * Busca um cliente por ID
   */
  async getClientById(req, res, next) {
    try {
      const clientId = parseInt(req.params.id);
      const salonId = req.salonId;
      const includeAppointments = req.query.appointments === 'true';

      const client = await clientService.getClientById(clientId, salonId, includeAppointments);

      return res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/clients
   * Cria um novo cliente
   */
  async createClient(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateCreateClient(req.body);
      
      const salonId = req.salonId;
      const client = await clientService.createClient(salonId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: client,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * PUT /api/clients/:id
   * Atualiza um cliente
   */
  async updateClient(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateUpdateClient(req.body);
      
      const clientId = parseInt(req.params.id);
      const salonId = req.salonId;

      const client = await clientService.updateClient(clientId, salonId, validatedData);

      return res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: client,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * DELETE /api/clients/:id
   * Desativa um cliente (soft delete)
   */
  async deleteClient(req, res, next) {
    try {
      const clientId = parseInt(req.params.id);
      const salonId = req.salonId;

      const client = await clientService.deactivateClient(clientId, salonId);

      return res.json({
        message: 'Cliente desativado com sucesso',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientController();

