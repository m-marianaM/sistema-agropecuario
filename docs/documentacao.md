# Documentação Técnica - Sistema Agropecuário

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [API Endpoints](#api-endpoints)
4. [Banco de Dados](#banco-de-dados)
5. [Frontend Components](#frontend-components)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## Visão Geral

O Sistema Agropecuário é uma aplicação web completa para gestão de fazendas, desenvolvida com arquitetura moderna e tecnologias atuais.

### Principais Características
- **Dashboard BI** com métricas em tempo real
- **Gestão completa** de fazendas, cultivos, vendas e estoque
- **Importação de dados** via planilhas Excel
- **Interface responsiva** com tema claro/escuro
- **API REST** documentada com Swagger
- **Autenticação JWT** segura
- **Containerização Docker** completa

## Arquitetura

### Stack Tecnológico
```
Frontend: React + TypeScript + TailwindCSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL
Container: Docker + Docker Compose
```

### Estrutura de Diretórios
```
SystemAgro/
├── backend/                 # API REST
│   ├── src/
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   └── server.ts       # Servidor principal
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Contextos
│   │   └── App.tsx         # App principal
│   └── package.json
├── docker-compose.yml      # Orquestração
└── docs/                   # Documentação
```

## API Endpoints

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.systemagro.com/api
```

### Autenticação

#### POST /auth/login
Autentica usuário no sistema.

**Request:**
```json
{
  "email": "usuario@fazenda.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Produtor",
    "email": "usuario@fazenda.com",
    "role": "produtor"
  }
}
```

#### POST /auth/register
Registra novo usuário.

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@fazenda.com",
  "senha": "senha123",
  "role": "produtor"
}
```

### Fazendas

#### GET /fazendas
Lista todas as fazendas com filtros opcionais.

**Query Parameters:**
- `proprietario` (string): Filtro por proprietário
- `estado` (string): Filtro por estado
- `minHectares` (number): Área mínima
- `maxHectares` (number): Área máxima

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Fazenda São João",
      "proprietario": "João Silva",
      "hectares": 150.5,
      "localizacao": {
        "cidade": "Ribeirão Preto",
        "estado": "SP",
        "coordenadas": { "lat": -21.1775, "lng": -47.8099 }
      },
      "createdAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### POST /fazendas
Cria nova fazenda.

**Request:**
```json
{
  "nome": "Fazenda Nova",
  "proprietario": "Maria Santos",
  "hectares": 200.0,
  "localizacao": {
    "cidade": "Uberlândia",
    "estado": "MG"
  }
}
```

#### GET /fazendas/:id
Busca fazenda específica por ID.

#### PUT /fazendas/:id
Atualiza dados da fazenda.

#### DELETE /fazendas/:id
Remove fazenda do sistema.

### Cultivos

#### GET /cultivos
Lista cultivos com filtros.

**Query Parameters:**
- `fazendaId` (number): Filtro por fazenda
- `cultura` (string): Filtro por tipo de cultura
- `status` (string): Filtro por status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fazendaId": 1,
      "cultura": "Soja",
      "areaPlantada": 80.5,
      "dataPlantio": "2024-10-15T00:00:00.000Z",
      "previsaoColheita": "2025-02-15T00:00:00.000Z",
      "status": "plantado",
      "producaoEstimada": 3200,
      "producaoReal": null,
      "observacoes": "Primeira safra da temporada"
    }
  ]
}
```

#### POST /cultivos
Registra novo plantio.

#### PATCH /cultivos/:id/colheita
Registra colheita do cultivo.

**Request:**
```json
{
  "producaoReal": 3100,
  "dataColheita": "2025-02-10",
  "observacoes": "Boa produtividade"
}
```

### Importação

#### POST /import/excel
Importa dados de planilha Excel.

**Request (multipart/form-data):**
- `file`: Arquivo Excel (.xlsx)
- `tipo`: Tipo de dados ("fazendas", "cultivos", "vendas", "estoque")

**Response:**
```json
{
  "success": true,
  "message": "25 registros importados com sucesso",
  "data": {
    "tipo": "fazendas",
    "totalRows": 27,
    "importedRows": 25,
    "skippedRows": 2
  }
}
```

#### GET /import/template/:tipo
Baixa template Excel para importação.

**Tipos disponíveis:**
- `fazendas`: Template para fazendas
- `cultivos`: Template para cultivos
- `vendas`: Template para vendas
- `estoque`: Template para estoque

## Banco de Dados

### Schema PostgreSQL

#### Tabela: fazendas
```sql
CREATE TABLE fazendas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  proprietario VARCHAR(255) NOT NULL,
  hectares DECIMAL(10,2) NOT NULL,
  localizacao JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: cultivos
```sql
CREATE TABLE cultivos (
  id SERIAL PRIMARY KEY,
  fazenda_id INTEGER REFERENCES fazendas(id),
  cultura VARCHAR(100) NOT NULL,
  area_plantada DECIMAL(10,2) NOT NULL,
  data_plantio DATE NOT NULL,
  previsao_colheita DATE,
  status VARCHAR(50) DEFAULT 'plantado',
  producao_estimada DECIMAL(10,2),
  producao_real DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: vendas
```sql
CREATE TABLE vendas (
  id SERIAL PRIMARY KEY,
  fazenda_id INTEGER REFERENCES fazendas(id),
  produto VARCHAR(100) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  comprador VARCHAR(255),
  data_venda DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: estoque
```sql
CREATE TABLE estoque (
  id SERIAL PRIMARY KEY,
  fazenda_id INTEGER REFERENCES fazendas(id),
  item VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(20) DEFAULT 'kg',
  valor_unitario DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: usuarios
```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'produtor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices Recomendados
```sql
CREATE INDEX idx_cultivos_fazenda ON cultivos(fazenda_id);
CREATE INDEX idx_cultivos_status ON cultivos(status);
CREATE INDEX idx_vendas_fazenda ON vendas(fazenda_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_estoque_fazenda ON estoque(fazenda_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
```

## Frontend Components

### Estrutura de Componentes

#### App.tsx
Componente raiz que orquestra toda a aplicação.
```typescript
- ThemeProvider (contexto de tema)
- Layout principal com Sidebar + Header + Main
- Roteamento de páginas
```

#### ThemeContext.tsx
Gerencia alternância de tema claro/escuro.
```typescript
- Estado do tema (light/dark)
- Persistência no localStorage
- Detecção de preferência do sistema
```

#### Header.tsx
Barra superior com navegação e controles.
```typescript
- Logo e informações do usuário
- Barra de pesquisa
- Toggle de tema
- Notificações
- Menu de usuário
```

#### Sidebar.tsx
Navegação lateral responsiva.
```typescript
- Menu de navegação principal
- Seções: Navegação, Ferramentas
- Responsividade mobile/desktop
- Estado colapsado/expandido
```

#### Dashboard.tsx
Painel principal com métricas e gráficos.
```typescript
- Cards de métricas principais
- Gráficos interativos (Recharts)
- Lista de fazendas
- Filtros de período
```

#### Card.tsx
Componente reutilizável para exibir dados.
```typescript
- Props genéricas para título, valor, ícone
- Variantes: MetricCard, FarmCard
- Suporte a tendências e badges
- Tema claro/escuro automático
```

### Padrões de Estilização

#### TailwindCSS Classes
```css
/* Layout responsivo */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

/* Tema escuro */
bg-white dark:bg-gray-800
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700

/* Estados hover/focus */
hover:bg-gray-100 dark:hover:bg-gray-700
focus:ring-2 focus:ring-green-500
```

#### Breakpoints
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

## Deployment

### Desenvolvimento Local

1. **Clone e instale dependências:**
```bash
git clone <repo>
cd SystemAgro
npm run install:all
```

2. **Configure ambiente:**
```bash
cp .env.example .env
# Edite as variáveis necessárias
```

3. **Execute com Docker:**
```bash
docker-compose up -d
```

4. **Ou execute manualmente:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm start
```

### Produção

#### Docker Compose
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
  
  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
  
  frontend:
    build: ./frontend
    environment:
      REACT_APP_API_URL: ${API_URL}
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### Variáveis de Ambiente Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/systemagro
JWT_SECRET=chave_muito_segura_de_produção
CORS_ORIGIN=https://systemagro.com
UPLOAD_MAX_SIZE=50MB
LOG_LEVEL=warn
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de conexão com banco
```bash
# Verifique se PostgreSQL está rodando
docker-compose ps

# Verifique logs do banco
docker-compose logs db

# Recrie o container se necessário
docker-compose down
docker-compose up -d
```

#### 2. Frontend não carrega
```bash
# Verifique se todas dependências estão instaladas
cd frontend && npm install

# Limpe cache e rebuilde
npm run build

# Verifique se backend está respondendo
curl http://localhost:3001/health
```

#### 3. Problemas com upload Excel
```bash
# Verifique permissões de arquivo
ls -la uploads/

# Verifique tamanho máximo configurado
grep UPLOAD_MAX_SIZE .env

# Teste com arquivo menor
curl -F "file=@teste.xlsx" http://localhost:3001/api/import/excel
```

#### 4. Erro de autenticação
```bash
# Verifique JWT_SECRET
echo $JWT_SECRET

# Teste login manual
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123456"}'
```

### Logs e Monitoramento

#### Backend Logs
```bash
# Logs em desenvolvimento
npm run dev

# Logs em produção
docker-compose logs -f backend

# Logs específicos
grep ERROR logs/app.log
```

#### Database Logs
```bash
# Logs PostgreSQL
docker-compose logs db

# Queries lentas
docker exec -it systemagro_db psql -U postgres -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;"
```

### Performance

#### Otimizações Backend
- Use conexão pool para PostgreSQL
- Implemente cache Redis para queries frequentes
- Otimize queries com EXPLAIN ANALYZE
- Use índices apropriados

#### Otimizações Frontend
- Lazy loading de componentes
- Memoização com React.memo
- Debounce em campos de busca
- Otimização de imagens

### Backup e Recovery

#### Backup Automático
```bash
# Script diário de backup
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
aws s3 cp backup_$(date +%Y%m%d).sql s3://systemagro-backups/
```

#### Restore
```bash
# Restore do backup
psql $DATABASE_URL < backup_20240115.sql
```

---

**Documentação atualizada em: Janeiro 2024**
**Versão: 1.0.0**
