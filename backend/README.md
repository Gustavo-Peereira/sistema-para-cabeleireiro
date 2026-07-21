# 🚀 Backend - Sistema de Agendamento de Salão

Backend desenvolvido em Node.js + Express + Prisma + MySQL para gestão de agendamentos de salão de beleza com sistema multi-tenant.

## 📋 Pré-requisitos

- Node.js >= 18.x
- MySQL >= 8.0
- npm ou yarn

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/salon_appointment"

# JWT
JWT_SECRET="seu_secret_jwt_aqui_change_me_in_production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
```

### 3. Criar banco de dados

Crie o banco de dados no MySQL:

```sql
CREATE DATABASE salon_appointment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Executar migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Popular banco com dados iniciais (seed)

```bash
npm run prisma:seed
```

**Credenciais criadas:**

**ADMIN:**
- Email: `admin@belezapura.com`
- Senha: `123456`

**PROFISSIONAIS:**
- Email: `joao@belezapura.com` | Senha: `123456`
- Email: `ana@belezapura.com` | Senha: `123456`

## 🎯 Executar

### Desenvolvimento (com nodemon)

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 📡 Endpoints da API

### Health Check
- `GET /health` - Verifica status da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

### Salão
- `GET /api/salon` - Dados do salão (ADMIN)

### Usuários (Profissionais)
- `GET /api/users` - Listar usuários (ADMIN)
- `POST /api/users` - Criar usuário (ADMIN)
- `PUT /api/users/:id` - Atualizar usuário (ADMIN)
- `PATCH /api/users/:id/active` - Ativar/desativar (ADMIN)

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/:id` - Detalhes do cliente
- `PUT /api/clients/:id` - Atualizar cliente

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço (ADMIN)
- `PUT /api/services/:id` - Atualizar serviço (ADMIN)
- `DELETE /api/services/:id` - Remover serviço (ADMIN)

### Agendamentos
- `GET /api/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&professionalId=X` - Listar
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/:id` - Atualizar agendamento
- `PATCH /api/appointments/:id/status` - Atualizar status
- `DELETE /api/appointments/:id` - Cancelar agendamento

### Bloqueios
- `GET /api/blocks?from=YYYY-MM-DD&to=YYYY-MM-DD&professionalId=X` - Listar
- `POST /api/blocks` - Criar bloqueio
- `DELETE /api/blocks/:id` - Remover bloqueio

## 🗂️ Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   ├── migrations/        # Migrations
│   └── seed.js           # Seed inicial
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Controllers
│   ├── services/         # Lógica de negócio
│   ├── middlewares/      # Middlewares
│   ├── validators/       # Validações
│   ├── routes/           # Rotas
│   ├── utils/            # Utilitários
│   └── server.js         # Servidor Express
├── .env                  # Variáveis de ambiente
└── package.json
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) para autenticação. O token deve ser enviado no header:

```
Authorization: Bearer {token}
```

## 👥 Papéis e Permissões

### ADMIN (Gerente)
- Acesso total ao sistema
- Gerencia usuários, serviços, clientes
- Visualiza e gerencia agenda de todos os profissionais

### PROFESSIONAL (Profissional)
- Gerencia apenas sua própria agenda
- Cria/edita clientes do salão
- Visualiza serviços (sem edição)
- Cria bloqueios apenas para si

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm start                # Inicia servidor em modo produção
npm run prisma:generate  # Gera cliente Prisma
npm run prisma:migrate   # Executa migrations
npm run prisma:seed      # Popula banco com dados iniciais
npm run prisma:studio    # Abre interface Prisma Studio
```

## 📊 Banco de Dados

### Modelos principais:
- **Salon** - Dados do salão (multi-tenant)
- **User** - Usuários/profissionais (ADMIN | PROFESSIONAL)
- **Client** - Clientes do salão
- **Service** - Serviços oferecidos
- **Appointment** - Agendamentos
- **Block** - Bloqueios de horário

Todas as tabelas possuem `salon_id` para isolamento de dados (multi-tenancy).

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT para autenticação stateless
- Helmet.js para headers de segurança
- CORS configurado
- Validação de entrada de dados
- Isolamento por tenant (salon_id)

## 📝 Licença

ISC



