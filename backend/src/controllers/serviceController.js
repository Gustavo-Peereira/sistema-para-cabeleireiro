const serviceService = require('../services/serviceService');
const { validateCreateService, validateUpdateService } = require('../validators/serviceValidator');
const { ValidationError } = require('../utils/errors');

class ServiceController {
  /**
   * GET /api/services
   * Lista todos os serviços do salão
   */
  async listServices(req, res, next) {
    try {
      const salonId = req.salonId;
      const { active } = req.query;

      const filters = {
        ...(active !== undefined && { active: active === 'true' }),
      };

      const services = await serviceService.listServices(salonId, filters);

      return res.json({
        success: true,
        data: services,
        total: services.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/services/:id
   * Busca um serviço por ID
   */
  async getServiceById(req, res, next) {
    try {
      const serviceId = parseInt(req.params.id);
      const salonId = req.salonId;

      const service = await serviceService.getServiceById(serviceId, salonId);

      return res.json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/services
   * Cria um novo serviço (apenas ADMIN)
   */
  async createService(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateCreateService(req.body);
      
      const salonId = req.salonId;
      const service = await serviceService.createService(salonId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso',
        data: service,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * PUT /api/services/:id
   * Atualiza um serviço (apenas ADMIN)
   */
  async updateService(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateUpdateService(req.body);
      
      const serviceId = parseInt(req.params.id);
      const salonId = req.salonId;

      const service = await serviceService.updateService(serviceId, salonId, validatedData);

      return res.json({
        success: true,
        message: 'Serviço atualizado com sucesso',
        data: service,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * DELETE /api/services/:id
   * Remove um serviço (apenas ADMIN)
   */
  async deleteService(req, res, next) {
    try {
      const serviceId = parseInt(req.params.id);
      const salonId = req.salonId;

      const service = await serviceService.deleteService(serviceId, salonId);

      return res.json({
        message: 'Serviço removido com sucesso',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();

