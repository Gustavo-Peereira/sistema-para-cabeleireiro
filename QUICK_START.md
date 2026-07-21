# 🚀 Guia de Início Rápido

Siga estes passos para ter o sistema rodando em minutos!

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) v18 ou superior
- [MySQL](https://www.mysql.com/) v8 ou superior
- npm (vem com Node.js)

## ⚡ Instalação Rápida

### 1. Backend (API)

```bash
# Navegue para a pasta backend
cd backend

# Instale as dependências
npm install

# Configure o banco de dados
# 1. Abra o MySQL e crie o banco:
mysql -u root -p
CREATE DATABASE salon_appointment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. Copie o arquivo de exemplo e configure
cp env.example .env

# 3. Edite o .env com suas credenciais do MySQL
# DATABASE_URL="mysql://SEU_USUARIO:SUA_SENHA@localhost:3306/salon_appointment"

# Execute as migrations e seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Inicie o backend
npm run dev
```

✅ Backend rodando em: `http://localhost:3000`

### 2. Frontend (Interface)

Em outro terminal:

```bash
# Navegue para a pasta frontend
cd frontend

# Instale as dependências
npm install

# Inicie o frontend
npm run dev
```

✅ Frontend rodando em: `http://localhost:5173`

## 🎯 Acessar o Sistema

Abra seu navegador em: `http://localhost:5173`

### Credenciais de Teste

**Administrador:**
- Email: `admin@belezapura.com`
- Senha: `123456`

**Profissional:**
- Email: `joao@belezapura.com`
- Senha: `123456`

## 🎮 Primeiros Passos

1. **Faça login** com uma das credenciais acima
2. **Explore o Dashboard** para ver a visão geral
3. **Cadastre clientes** em "Clientes"
4. **Configure serviços** em "Serviços" (se for ADMIN)
5. **Crie agendamentos** para testar o sistema

## 🔧 Comandos Úteis

### Backend

```bash
npm run dev              # Servidor em desenvolvimento
npm run prisma:studio    # Interface visual do banco
npm run prisma:seed      # Recarregar dados de exemplo
```

### Frontend

```bash
npm run dev     # Servidor em desenvolvimento
npm run build   # Build para produção
```

## 🐛 Problemas Comuns

### Erro de Conexão com MySQL

**Problema:** `Error: Can't connect to MySQL server`

**Solução:**
1. Verifique se o MySQL está rodando: `mysql -u root -p`
2. Confirme as credenciais no arquivo `.env`
3. Certifique-se de que o banco `salon_appointment` foi criado

### Porta já em uso

**Problema:** `Port 3000 is already in use`

**Solução:**
1. Encerre o processo na porta: `npx kill-port 3000`
2. Ou altere a porta no `.env`: `PORT=3001`

### Módulos não encontrados

**Problema:** `Cannot find module...`

**Solução:**
```bash
# Delete node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale
npm install
```

## 📚 Próximos Passos

Agora que o sistema está funcionando:

1. Leia o [README.md](README.md) completo para entender melhor
2. Explore o código fonte em `backend/src` e `frontend/src`
3. Veja a documentação da API no [README do backend](backend/README.md)
4. Personalize o sistema para suas necessidades

## 💡 Dicas

- Use `admin@belezapura.com` para ter acesso completo ao sistema
- Use `joao@belezapura.com` para testar a visão de profissional
- O sistema já vem com clientes e serviços de exemplo
- Experimente criar agendamentos em horários conflitantes para ver as validações

## 🆘 Precisa de Ajuda?

- Consulte os arquivos README.md do backend e frontend
- Verifique os logs do terminal para mensagens de erro
- Use o Prisma Studio para visualizar os dados: `npm run prisma:studio`

---

**Pronto! Agora você tem um sistema completo de agendamento rodando! 🎉**



