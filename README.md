# 💈 Sistema de Agendamento para Salão de Beleza

Sistema web completo de agendamento para salão de beleza, desenvolvido com arquitetura moderna e foco em usabilidade, segurança e escalabilidade.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Permissões e Roles](#permissões-e-roles)
- [API](#api)
- [Próximos Passos](#próximos-passos)

## 🎯 Visão Geral

Sistema desenvolvido para gerenciar agendamentos de um salão de beleza com múltiplos profissionais e clientes compartilhados. Implementa multi-tenancy (preparado para múltiplos salões), autenticação JWT, controle de permissões por role e regras de negócio robustas para prevenir conflitos de horário.

### ✨ Destaques

- ✅ **Multi-tenancy** - Isolamento de dados por salão (salon_id)
- ✅ **RBAC** - Controle de acesso baseado em papéis (ADMIN / PROFESSIONAL)
- ✅ **Regras de Conflito** - Sistema inteligente que previne agendamentos sobrepostos
- ✅ **Interface Moderna** - Design responsivo com Material UI
- ✅ **API RESTful** - Backend bem estruturado com Node.js + Express
- ✅ **Banco Relacional** - MySQL com Prisma ORM

## 🚀 Funcionalidades

### ✅ Implementadas

#### Autenticação e Autorização
- Login com email e senha
- JWT com expiração configurável
- Middleware de autenticação e autorização
- Proteção de rotas por role (ADMIN / PROFESSIONAL)

#### Gestão de Clientes
- CRUD completo de clientes
- Busca por nome, telefone ou email
- Histórico de atendimentos
- Clientes compartilhados entre profissionais do salão

#### Gestão de Serviços
- CRUD de serviços (apenas ADMIN)
- Definição de duração e preço
- Ativação/desativação de serviços
- Todos podem visualizar serviços

#### Gestão de Usuários/Profissionais
- CRUD de usuários (apenas ADMIN)
- Ativação/desativação de profissionais
- Reset de senha
- Perfis: ADMIN e PROFESSIONAL

#### Agendamentos
- Criar, editar e cancelar agendamentos
- Status: PENDING, CONFIRMED, DONE, NO_SHOW, CANCELED
- Validação de conflito de horário (agendamentos e bloqueios)
- ADMIN vê todos os agendamentos
- PROFESSIONAL vê apenas próprios agendamentos
- Duração automática baseada no serviço

#### Bloqueios de Horário
- ADMIN pode criar bloqueios para qualquer profissional
- PROFESSIONAL cria bloqueios apenas para si
- Validação de conflito com agendamentos existentes

#### Dashboard
- Estatísticas em tempo real
- Próximos agendamentos
- Visão adaptada por perfil

### 🚧 Próximas Funcionalidades

- Agenda visual (calendar view)
- Lembretes por WhatsApp
- Sistema de pagamentos
- Relatórios e gráficos
- Histórico de atendimentos por cliente
- Sistema de avaliações
- Gestão de comissões
- Controle de estoque

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM moderno
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **bcrypt** - Hash de senhas
- **date-fns** - Manipulação de datas

### Frontend
- **React** 18 - Biblioteca UI
- **Vite** - Build tool ultrarrápido
- **Material UI** - Componentes UI
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Notistack** - Sistema de notificações

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│          FRONTEND (React + Vite)        │
│  - AuthContext (gerenciamento de estado)│
│  - Material UI (componentes)            │
│  - Axios + JWT (comunicação)            │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│       BACKEND (Node + Express)          │
│  - Controllers (rotas e validações)     │
│  - Services (lógica de negócio)         │
│  - Middlewares (auth, RBAC, tenant)     │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│           DATABASE (MySQL)              │
│  - Multi-tenant (salon_id)              │
│  - Índices otimizados                   │
└─────────────────────────────────────────┘
```

### Modelo de Dados

```
Salons (salões)
  ├── Users (usuários/profissionais)
  ├── Clients (clientes)
  ├── Services (serviços)
  ├── Appointments (agendamentos)
  └── Blocks (bloqueios de horário)
```

Todas as tabelas possuem `salon_id` para isolamento multi-tenant.

## 📦 Instalação

### Pré-requisitos

- Node.js >= 18.x
- MySQL >= 8.0
- npm ou yarn

### Passo a Passo

#### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd projeto_cabeleleiro
```

#### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado no `env.example`:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/salon_appointment"
JWT_SECRET="seu_secret_jwt_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

Crie o banco de dados:

```sql
CREATE DATABASE salon_appointment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Execute as migrations e seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Inicie o backend:

```bash
npm run dev
```

O backend estará em: `http://localhost:3000`

#### 3. Configurar Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em: `http://localhost:5173`

## 🎮 Uso

### Acesso ao Sistema

Após executar o seed, você terá as seguintes credenciais:

**ADMIN:**
- Email: `admin@belezapura.com`
- Senha: `123456`

**PROFISSIONAIS:**
- Email: `joao@belezapura.com` | Senha: `123456`
- Email: `ana@belezapura.com` | Senha: `123456`

### Fluxo de Uso

1. **Login** - Acesse `/login` e entre com as credenciais
2. **Dashboard** - Veja resumo de agendamentos
3. **Clientes** - Cadastre clientes do salão
4. **Serviços** - Configure os serviços oferecidos (ADMIN)
5. **Agendamentos** - Crie e gerencie agendamentos
6. **Bloqueios** - Bloqueie horários quando necessário

## 📁 Estrutura do Projeto

```
projeto_cabeleleiro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 👥 Permissões e Roles

### ADMIN (Administrador/Gerente)

✅ **Pode:**
- Ver e gerenciar TODOS os agendamentos
- Criar/editar/desativar usuários (profissionais)
- CRUD completo de clientes
- CRUD completo de serviços
- Criar bloqueios para qualquer profissional
- Acessar configurações do salão
- Ver dashboard geral

### PROFESSIONAL (Profissional/Funcionário)

✅ **Pode:**
- Ver e gerenciar APENAS sua própria agenda
- Ver lista de clientes do salão
- Criar/editar clientes
- Ver serviços (somente leitura)
- Criar bloqueios apenas para si

❌ **NÃO Pode:**
- Gerenciar outros profissionais
- Criar/editar serviços
- Ver agendamentos de outros profissionais
- Acessar configurações do salão

## 🔌 API

### Endpoints Principais

#### Autenticação
```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password
```

#### Salão
```
GET    /api/salon
PUT    /api/salon (ADMIN)
```

#### Usuários
```
GET    /api/users (ADMIN)
GET    /api/users/professionals
POST   /api/users (ADMIN)
PUT    /api/users/:id (ADMIN)
PATCH  /api/users/:id/active (ADMIN)
```

#### Clientes
```
GET    /api/clients
GET    /api/clients/:id
GET    /api/clients/search-phone?phone=X
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

#### Serviços
```
GET    /api/services
POST   /api/services (ADMIN)
PUT    /api/services/:id (ADMIN)
DELETE /api/services/:id (ADMIN)
```

#### Agendamentos
```
GET    /api/appointments?from=X&to=Y&professionalId=Z
POST   /api/appointments
PUT    /api/appointments/:id
PATCH  /api/appointments/:id/status
DELETE /api/appointments/:id
```

#### Bloqueios
```
GET    /api/blocks?from=X&to=Y&professionalId=Z
POST   /api/blocks
DELETE /api/blocks/:id
```

### Autenticação nas Requisições

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer {token}
```

## 🔒 Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT com expiração configurável
- Helmet.js para headers de segurança
- CORS configurado
- Validação de entrada em todos os endpoints
- Isolamento de dados por tenant (salon_id)
- Proteção contra SQL Injection (Prisma)

## 🎨 Regras de Negócio

### Conflito de Horário

Um agendamento/bloqueio **NÃO pode** ser criado se:

```
start < existente.end AND end > existente.start
```

O sistema valida contra:
- Outros agendamentos do mesmo profissional (status diferente de CANCELED)
- Bloqueios existentes do profissional

### Duração Automática

Ao criar um agendamento, se `endDatetime` não for fornecido:

```
endDatetime = startDatetime + service.duration (minutos)
```

### Status de Agendamento

- **PENDING** - Agendamento criado, aguardando confirmação
- **CONFIRMED** - Cliente confirmou presença
- **DONE** - Atendimento realizado
- **NO_SHOW** - Cliente não compareceu
- **CANCELED** - Agendamento cancelado

## 📄 Licença

ISC

## 👨‍💻 Desenvolvimento

Este sistema foi desenvolvido seguindo as melhores práticas de:

- Clean Code
- SOLID Principles
- RESTful API Design
- Security Best Practices
- Responsive Design
- User Experience (UX)

---

**Desenvolvido com ❤️ para facilitar a gestão de salões de beleza**



