# 🌾 Sistema Agropecuário - Gestão Inteligente de Fazendas

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-lightgrey.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Sobre o Projeto

O **Sistema Agropecuário** é uma aplicação web moderna e completa para gestão de fazendas, desenvolvida com tecnologias de ponta para oferecer uma experiência intuitiva e eficiente na administração de propriedades rurais.

### ✨ Principais Funcionalidades

- 🧑‍🌾 **Gestão de Fazendas**: Cadastro e controle completo de propriedades rurais
- 🌱 **Cultivos**: Controle detalhado de plantio, crescimento e colheita
- 🧪 **Adubagem**: Gestão de fertilizantes e aplicações
- 💰 **Vendas**: Registro e acompanhamento de vendas de produtos
- 📦 **Estoque**: Controle de ração e insumos agrícolas
- 📊 **Dashboard BI**: Métricas e gráficos para tomada de decisão
- 📱 **Interface Responsiva**: Funciona perfeitamente em mobile, tablet e desktop
- 🌙 **Tema Claro/Escuro**: Alternância entre temas para melhor experiência
- 📁 **Importação Excel**: Upload e processamento de planilhas

## 🏗️ Arquitetura do Sistema

### Frontend (React + TypeScript)
- **React 18** com TypeScript para tipagem rigorosa
- **TailwindCSS** para estilização moderna e responsiva
- **Recharts** para gráficos e dashboards interativos
- **Lucide React** para ícones consistentes
- **Context API** para gerenciamento de estado global
- **Axios** para comunicação com a API

### Backend (Node.js + Express)
- **Node.js** com Express e TypeScript
- **PostgreSQL/SQLite** como banco de dados
- **Prisma ORM** para modelagem e queries
- **JWT** para autenticação segura
- **Swagger** para documentação da API
- **Multer** para upload de arquivos
- **XLSX** para processamento de planilhas Excel
- **Express Validator** para validação de dados

### DevOps
- **Docker** e **Docker Compose** para containerização
- **Git** para controle de versão
- **ESLint** e **Prettier** para qualidade de código

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18.0 ou superior
- NPM ou Yarn
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/m-marianaM/sistema-agropecuario.git
cd sistema-agropecuario
```

### 2. Instale as Dependências
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configure o Banco de Dados
```bash
cd ../backend

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Popular banco com dados iniciais
npx prisma db seed
```

### 4. Execute o Sistema
```bash
# Voltar para o diretório raiz
cd ..

# Executar backend e frontend simultaneamente
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Documentação da API**: http://localhost:3001/api-docs

### 5. Credenciais de Acesso
```
Email: admin@systemagro.com
Senha: admin123
```

## 📁 Estrutura do Projeto

```
sistema-agropecuario/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── routes/         # Rotas da API REST
│   │   ├── middleware/     # Middlewares de autenticação e validação
│   │   ├── lib/           # Configurações (Prisma, etc.)
│   │   └── server.ts      # Servidor principal
│   ├── prisma/
│   │   ├── schema.prisma  # Schema do banco de dados
│   │   └── dev.db        # Banco SQLite (desenvolvimento)
│   └── package.json
├── frontend/               # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes React reutilizáveis
│   │   ├── context/      # Contextos React (Theme, Auth, etc.)
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── utils/        # Utilitários e helpers
│   │   └── App.tsx       # Componente principal
│   └── package.json
├── docs/                  # Documentação do projeto
├── docker-compose.yml     # Configuração Docker
├── package.json          # Scripts principais
└── README.md             # Este arquivo
```

## 🎯 Funcionalidades Detalhadas

### Dashboard BI
- Visualização em tempo real de métricas de produção
- Gráficos interativos de cultivos por tipo (Milho, Soja, etc.)
- Análise de performance e tendências
- Cards informativos com dados consolidados

### Gestão de Cultivos
- Cadastro completo de cultivos com todas as informações relevantes
- Controle de status: plantado → crescimento → colhido/perdido
- Associação com fazendas e cálculo automático de áreas
- Estimativas de produção e custos

### Sistema de Autenticação
- Login seguro com JWT
- Diferentes níveis de acesso (Administrador, Supervisor, Peão)
- Controle de permissões por módulo
- Sessões persistentes

### Interface Responsiva
- Design mobile-first
- Componentes adaptativos para diferentes tamanhos de tela
- Navegação otimizada para touch e mouse
- Tema escuro/claro automático

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Recharts
- Lucide React
- Axios
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite/PostgreSQL
- JWT
- Bcrypt
- Express Validator
- Swagger UI

### Ferramentas de Desenvolvimento
- ESLint
- Prettier
- Concurrently
- Nodemon
- TypeScript Compiler

## 📊 Modelos de Dados

### Principais Entidades
- **Fazenda**: Propriedade rural com informações completas
- **Cultivo**: Plantio em uma fazenda com cultura, área, datas e status
- **Usuario**: Funcionários com diferentes níveis de acesso
- **Adubo**: Aplicações de fertilizantes
- **Venda**: Transações de vendas de produtos
- **Estoque**: Controle de insumos e materiais

## 🔒 Segurança

- Autenticação JWT com expiração configurável
- Senhas criptografadas com bcrypt
- Validação rigorosa de dados de entrada
- Controle de permissões por módulo e ação
- Headers de segurança configurados

## 📈 Performance

- Lazy loading de componentes
- Otimização de queries com Prisma
- Cache de dados no frontend
- Compressão de assets
- Images otimizadas

## 🧪 Testes

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## 📝 Documentação da API

A documentação completa da API está disponível através do Swagger UI em:
http://localhost:3001/api-docs

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.


- Documentação: [Link para documentação completa]

## 🔄 Versionamento

Este projeto segue o padrão [Semantic Versioning](https://semver.org/).

**Versão Atual**: 1.0.0

## 🎉 Agradecimentos

Agradecemos a todos que contribuíram para tornar este projeto uma realidade, especialmente à comunidade open source que fornece as ferramentas e bibliotecas que utilizamos.

---

**© 2025 Sistema Agropecuário. Todos os direitos reservados.**
