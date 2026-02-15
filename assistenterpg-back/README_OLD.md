# AssistenteRPG - Jujutsu Kaisen - Backend

Backend da aplicação web para gerenciamento de campanhas e personagens do sistema de RPG de mesa baseado em Jujutsu Kaisen.

## 🚀 Stack Tecnológica

- **Framework**: NestJS 10.x
- **Linguagem**: TypeScript 5.x
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT
- **WebSockets**: Socket.io
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator & class-transformer

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x ou yarn >= 1.22.x
- PostgreSQL >= 14.x

## 🔧 Instalação

Clone o repositório
git clone https://github.com/viniciusfs-seno/rpg-jujutsu-backend.git
cd rpg-jujutsu-backend

Instale as dependências
npm install

ou
yarn install


## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/rpg_jujutsu?schema=public"

JWT
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRATION="7d"

App
PORT=3000
NODE_ENV="development"

Cloudinary (Upload de Imagens)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

CORS
FRONTEND_URL="http://localhost:3001"


## 🗄️ Banco de Dados

Gerar o Prisma Client
npx prisma generate

Executar migrations
npx prisma migrate dev

Abrir Prisma Studio (interface visual do banco)
npx prisma studio


## 🏃 Execução

Desenvolvimento
npm run start:dev

Produção
npm run build
npm run start:prod

Watch mode
npm run start:debug


## 📁 Estrutura do Projeto

src/
├── auth/ # Módulo de autenticação
├── users/ # Gerenciamento de usuários
├── campaigns/ # Gerenciamento de campanhas
├── characters/ # Criação e gestão de personagens
│ ├── dto/
│ ├── entities/
│ └── services/
├── combat/ # Sistema de combate e iniciativa
├── chat/ # WebSocket para chat em tempo real
│ └── gateways/
├── rules/ # Documentação do sistema de RPG
├── sessions/ # Relatórios e anotações de sessões
├── common/ # Utilitários, guards, interceptors
│ ├── decorators/
│ ├── guards/
│ ├── interceptors/
│ └── pipes/
├── config/ # Configurações da aplicação
└── prisma/ # Schema e migrations do Prisma
├── migrations/
└── schema.prisma


## 📡 WebSockets

O servidor utiliza Socket.io para comunicação em tempo real:

- **Chat**: `/chat` namespace
- **Combate/Iniciativa**: `/combat` namespace

Exemplo de conexão:
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
auth: { token: 'seu-jwt-token' }
});


## 📚 Documentação da API

Após iniciar o servidor, acesse a documentação Swagger em:

http://localhost:3000/api/docs


## 🧪 Testes

Testes unitários
npm run test

Testes e2e
npm run test:e2e

Cobertura de testes
npm run test:cov


## 🚢 Deploy

**Opções de hosting gratuito:**
- Railway
- Render
- Fly.io
- Heroku (tier gratuito limitado)

### Deploy no Railway (exemplo)

Instalar Railway CLI
npm install -g @railway/cli

Login
railway login

Inicializar projeto
railway init

Deploy
railway up


## 📝 Scripts Disponíveis


{
"start": "Inicia a aplicação",
"start:dev": "Inicia em modo desenvolvimento com hot-reload",
"start:debug": "Inicia em modo debug",
"start:prod": "Inicia em modo produção",
"build": "Compila o projeto",
"test": "Executa testes unitários",
"test:e2e": "Executa testes end-to-end",
"prisma:generate": "Gera o Prisma Client",
"prisma:migrate": "Executa migrations do banco",
"prisma:studio": "Abre o Prisma Studio"
}


## 🔐 Segurança

- Autenticação via JWT
- Validação de dados em todas as rotas
- Rate limiting implementado
- CORS configurado
- Helmet.js para headers de segurança
- bcrypt para hash de senhas

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
2. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
3. Push para a branch (`git push origin feature/MinhaFeature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso pessoal.

## 👤 Autor

**Vinicius Ferreira Seno**
- GitHub: [@viniciusfs-seno](https://github.com/viniciusfs-seno)

---

**Status do Projeto**: 🚧 Em desenvolvimento ativo

