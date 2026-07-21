require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Salon Appointment API',
  });
});

// Rotas da API
app.use('/api', routes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message || err);

  // AppError customizado (nossos erros)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Erros do Prisma
  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Registro duplicado. Este dado já existe no sistema',
        field: err.meta?.target,
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Registro não encontrado',
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Violação de chave estrangeira. Verifique os dados relacionados',
      });
    }
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

