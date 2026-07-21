const prisma = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class SalonService {
  /**
   * Busca dados do salão
   * @param {Number} salonId - ID do salão
   * @returns {Object} Dados do salão
   */
  async getSalon(salonId) {
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        cnpj: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!salon) {
      throw new NotFoundError('Salão não encontrado');
    }

    return salon;
  }

  /**
   * Atualiza dados do salão (apenas ADMIN)
   * @param {Number} salonId - ID do salão
   * @param {Object} data - Dados para atualizar
   * @returns {Object} Salão atualizado
   */
  async updateSalon(salonId, data) {
    const { name, email, phone, address, cnpj } = data;

    const salon = await prisma.salon.update({
      where: { id: salonId },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(cnpj !== undefined && { cnpj }),
      },
    });

    return salon;
  }
}

module.exports = new SalonService();



