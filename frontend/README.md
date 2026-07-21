# 🎨 Frontend - Sistema de Agendamento de Salão

Frontend desenvolvido em React + Vite + Material UI para gestão de agendamentos de salão de beleza.

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm ou yarn
- Backend rodando em `http://localhost:3000`

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Executar em desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 3. Build para produção

```bash
npm run build
```

Os arquivos buildados estarão na pasta `dist/`.

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login com email e senha
- Proteção de rotas privadas
- Logout
- Persistência de sessão

### ✅ Dashboard
- Visão geral de agendamentos
- Estatísticas em tempo real
- Lista de próximos atendimentos
- Adaptado por perfil (ADMIN vs PROFESSIONAL)

### ✅ Layout Responsivo
- Sidebar com navegação
- Menu adaptado por role
- Header com informações do usuário
- Design mobile-first

### 🚧 Em Desenvolvimento
As seguintes páginas estão com placeholder e serão implementadas:
- Agenda Geral (ADMIN)
- Minha Agenda (PROFESSIONAL)
- Gestão de Clientes
- Gestão de Profissionais (ADMIN)
- Gestão de Serviços (ADMIN)
- Gestão de Bloqueios
- Configurações (ADMIN)

## 🗂️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── api/              # Módulos de comunicação com API
│   │   ├── axios.js      # Configuração do Axios
│   │   ├── auth.js       # Endpoints de autenticação
│   │   ├── users.js      # Endpoints de usuários
│   │   ├── clients.js    # Endpoints de clientes
│   │   ├── services.js   # Endpoints de serviços
│   │   ├── appointments.js
│   │   └── blocks.js
│   ├── contexts/         # Contexts do React
│   │   └── AuthContext.jsx
│   ├── layouts/          # Layouts principais
│   │   └── MainLayout.jsx
│   ├── pages/            # Páginas da aplicação
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   └── PlaceholderPage.jsx
│   ├── routes/           # Configuração de rotas
│   │   └── PrivateRoute.jsx
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Entry point
│   └── index.css         # Estilos globais
├── index.html
├── vite.config.js
└── package.json
```

## 🔐 Autenticação

O sistema usa JWT armazenado no localStorage. O token é automaticamente anexado em todas as requisições via interceptor do Axios.

## 👥 Perfis de Usuário

### ADMIN (Administrador)
- Acesso completo ao sistema
- Visualiza agenda de todos os profissionais
- Gerencia usuários, serviços e configurações

### PROFESSIONAL (Profissional)
- Acesso limitado à própria agenda
- Visualiza e gerencia clientes do salão
- Cria bloqueios apenas para si

## 🎨 UI/UX

- **Design System:** Material UI v5
- **Ícones:** Material Icons
- **Notificações:** Notistack
- **Date Picker:** MUI X Date Pickers
- **Formulários:** React Hook Form + Zod
- **Tema:** Customizável via MUI Theme

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobile (320px+)

## 🔧 Tecnologias Utilizadas

- **React** 18.2 - Biblioteca UI
- **Vite** - Build tool
- **React Router DOM** - Roteamento
- **Material UI** - Componentes UI
- **Axios** - Requisições HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **date-fns** - Manipulação de datas
- **Notistack** - Sistema de notificações

## 🚀 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor de desenvolvimento
npm run build     # Build para produção
npm run preview   # Preview do build
npm run lint      # Executa linter
```

## 🔗 Integração com Backend

O frontend se comunica com o backend através de proxy configurado no Vite:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

## 📝 Próximos Passos

1. Implementar páginas de gestão completas
2. Adicionar sistema de busca e filtros avançados
3. Implementar agenda visual (calendar view)
4. Adicionar notificações em tempo real
5. Implementar sistema de relatórios
6. Adicionar tema escuro
7. Implementar PWA (Progressive Web App)

## 📄 Licença

ISC



