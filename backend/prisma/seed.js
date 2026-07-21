const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.appointment.deleteMany();
  await prisma.block.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.salon.deleteMany();

  console.log('✅ Dados anteriores removidos');

  // Criar Salão
  const salon = await prisma.salon.create({
    data: {
      name: 'Salão Beleza Pura',
      email: 'contato@belezapura.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      cnpj: '12.345.678/0001-90',
      active: true,
    },
  });

  console.log(`✅ Salão criado: ${salon.name} (ID: ${salon.id})`);

  // Criar usuários
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      salonId: salon.id,
      name: 'Maria Silva',
      email: 'admin@belezapura.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 91234-5678',
      active: true,
    },
  });

  const professional1 = await prisma.user.create({
    data: {
      salonId: salon.id,
      name: 'João Santos',
      email: 'joao@belezapura.com',
      password: hashedPassword,
      role: 'PROFESSIONAL',
      phone: '(11) 92345-6789',
      active: true,
    },
  });

  const professional2 = await prisma.user.create({
    data: {
      salonId: salon.id,
      name: 'Ana Costa',
      email: 'ana@belezapura.com',
      password: hashedPassword,
      role: 'PROFESSIONAL',
      phone: '(11) 93456-7890',
      active: true,
    },
  });

  console.log(`✅ Usuários criados:`);
  console.log(`   - ${admin.name} (ADMIN) - email: ${admin.email}`);
  console.log(`   - ${professional1.name} (PROFESSIONAL) - email: ${professional1.email}`);
  console.log(`   - ${professional2.name} (PROFESSIONAL) - email: ${professional2.email}`);
  console.log(`   - Senha padrão para todos: 123456`);

  // Criar serviços
  const services = await prisma.service.createMany({
    data: [
      {
        salonId: salon.id,
        name: 'Corte Feminino',
        description: 'Corte de cabelo feminino com finalização',
        duration: 60,
        price: 80.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Corte Masculino',
        description: 'Corte de cabelo masculino com acabamento',
        duration: 30,
        price: 45.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Coloração',
        description: 'Coloração completa',
        duration: 120,
        price: 180.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Escova',
        description: 'Escova com secador',
        duration: 45,
        price: 60.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Hidratação',
        description: 'Tratamento de hidratação profunda',
        duration: 60,
        price: 90.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Manicure',
        description: 'Manicure completa',
        duration: 45,
        price: 35.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Pedicure',
        description: 'Pedicure completa',
        duration: 45,
        price: 40.00,
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Barba',
        description: 'Design de barba',
        duration: 30,
        price: 35.00,
        active: true,
      },
    ],
  });

  console.log(`✅ ${services.count} serviços criados`);

  // Criar clientes de exemplo
  const clients = await prisma.client.createMany({
    data: [
      {
        salonId: salon.id,
        name: 'Carlos Oliveira',
        email: 'carlos@email.com',
        phone: '(11) 94567-8901',
        cpf: '123.456.789-01',
        birthdate: new Date('1985-05-15'),
        notes: 'Cliente VIP - prefere horários pela manhã',
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Juliana Ferreira',
        email: 'juliana@email.com',
        phone: '(11) 95678-9012',
        cpf: '234.567.890-12',
        birthdate: new Date('1990-08-22'),
        notes: 'Alérgica a alguns produtos - verificar antes',
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Roberto Lima',
        email: 'roberto@email.com',
        phone: '(11) 96789-0123',
        active: true,
      },
      {
        salonId: salon.id,
        name: 'Patrícia Mendes',
        email: 'patricia@email.com',
        phone: '(11) 97890-1234',
        birthdate: new Date('1988-12-10'),
        active: true,
      },
    ],
  });

  console.log(`✅ ${clients.count} clientes criados`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   ADMIN:');
  console.log('   - Email: admin@belezapura.com');
  console.log('   - Senha: 123456');
  console.log('\n   PROFISSIONAIS:');
  console.log('   - Email: joao@belezapura.com | Senha: 123456');
  console.log('   - Email: ana@belezapura.com | Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



