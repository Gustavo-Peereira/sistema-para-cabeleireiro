const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Teste de conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados MySQL');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
});

module.exports = prisma;



