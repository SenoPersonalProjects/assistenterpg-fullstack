# Assistente RPG - Fullstack

Monorepo contendo backend (NestJS) e frontend (Next.js) do Assistente RPG.

## 📂 Estrutura

# Assistente RPG - Fullstack

Monorepo contendo backend (NestJS) e frontend (Next.js) do Assistente RPG.

## 📂 Estrutura

fullstack/
├── backend/ # API NestJS + Prisma
└── frontend/ # App Next.js 15


## 🚀 Instalação

### Backend
```bash
cd backend
npm install
npm run db:push        # Sincronizar Prisma
npm run db:seed        # Popular banco
npm run dev            # Rodar em http://localhost:3000
```

### Frontend

cd frontend
npm install
npm run dev            # Rodar em http://localhost:3001

### 🛠️ Tecnologias
Backend: NestJS, Prisma, PostgreSQL

Frontend: Next.js 15, React 19, TailwindCSS

Autenticação: JWT (cookies)


***