const express = require('express');
const router = express.Router();

// Importar rotas (serão criadas nas próximas etapas)
const authRoutes = require('./auth.routes');
const salonRoutes = require('./salon.routes');
const userRoutes = require('./user.routes');
const clientRoutes = require('./client.routes');
const serviceRoutes = require('./service.routes');
const appointmentRoutes = require('./appointment.routes');
const blockRoutes = require('./block.routes');

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/salon', salonRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/blocks', blockRoutes);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API de Agendamento de Salão',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      salon: '/api/salon',
      users: '/api/users',
      clients: '/api/clients',
      services: '/api/services',
      appointments: '/api/appointments',
      blocks: '/api/blocks',
    },
  });
});

module.exports = router;



