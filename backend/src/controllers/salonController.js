const salonService = require('../services/salonService');

class SalonController {
  /**
   * GET /api/salon
   * Retorna dados do salão
   */
  async getSalon(req, res, next) {
    try {
      const salonId = req.salonId;
      const salon = await salonService.getSalon(salonId);

      return res.json({
        success: true,
        data: salon,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/salon
   * Atualiza dados do salão (apenas ADMIN)
   */
  async updateSalon(req, res, next) {
    try {
      const salonId = req.salonId;
      const data = req.body;

      const salon = await salonService.updateSalon(salonId, data);

      return res.json({
        success: true,
        message: 'Salão atualizado com sucesso',
        data: salon,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalonController();

