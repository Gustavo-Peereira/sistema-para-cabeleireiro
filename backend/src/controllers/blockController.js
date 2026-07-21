const blockService = require('../services/blockService');
const { validateCreateBlock } = require('../validators/blockValidator');
const { ValidationError } = require('../utils/errors');

class BlockController {
  /**
   * GET /api/blocks
   * Lista bloqueios do salão
   */
  async listBlocks(req, res, next) {
    try {
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;
      const { from, to, professionalId } = req.query;

      const filters = {
        ...(from && { from }),
        ...(to && { to }),
        ...(professionalId && { professionalId }),
      };

      const blocks = await blockService.listBlocks(salonId, userId, userRole, filters);

      return res.json({
        success: true,
        data: blocks,
        total: blocks.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/blocks/:id
   * Busca um bloqueio por ID
   */
  async getBlockById(req, res, next) {
    try {
      const blockId = parseInt(req.params.id);
      const salonId = req.salonId;

      const block = await blockService.getBlockById(blockId, salonId);

      return res.json({
        success: true,
        data: block,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/blocks
   * Cria um novo bloqueio
   */
  async createBlock(req, res, next) {
    try {
      // Validar dados de entrada
      const validatedData = validateCreateBlock(req.body);
      
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const block = await blockService.createBlock(salonId, userId, userRole, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Bloqueio criado com sucesso',
        data: block,
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return next(new ValidationError('Dados inválidos', error.errors));
      }
      next(error);
    }
  }

  /**
   * DELETE /api/blocks/:id
   * Remove um bloqueio
   */
  async deleteBlock(req, res, next) {
    try {
      const blockId = parseInt(req.params.id);
      const salonId = req.salonId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const block = await blockService.deleteBlock(blockId, salonId, userId, userRole);

      return res.json({
        message: 'Bloqueio removido com sucesso',
        data: block,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BlockController();

