# 🌾 Sistema Agropecuário

**Sistema de gestão agropecuária completo com Dashboard BI, autenticação segura e conformidade Azure Security Benchmark v3**

[![Security](https://img.shields.io/badge/Security-Azure%20Benchmark%20v3-blue)](./docs/SEGURANCA_COMPLETA.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## 🚀 Funcionalidades Principais

### 📊 **Dashboard BI Completo**
- Métricas de produção em tempo real
- Gráficos interativos com Recharts
- Análise de vendas e lucratividade
- Relatórios de performance

### 🧑‍🌾 **Gestão de Fazendas**
- Cadastro de propriedades rurais
- Controle de área plantada
- Gestão de localização e proprietários

### 🌱 **Controle de Cultivos**
- Registro de plantio e colheita
- Acompanhamento de crescimento
- Controle de perdas e produtividade

### 💰 **Gestão de Vendas**
- Registro de vendas por produto
- Controle de preços e margens
- Relatórios financeiros

### 📦 **Controle de Estoque**
- Gestão de ração e insumos
- Controle de entrada e saída
- Alertas de estoque baixo

### 🔒 **Segurança Enterprise**
- Autenticação JWT com MFA
- Criptografia de dados
- Logs de auditoria completos
- Conformidade Azure Security Benchmark v3

---

## 🛡️ **Segurança Implementada**

### ✅ **14 Requisitos de Segurança Atendidos**

1. **Validação de Entrada**: express-validator + DOMPurify
2. **Autenticação JWT**: Tokens seguros com cookies HttpOnly
3. **Criptografia**: bcrypt para senhas + Azure Key Vault
4. **Variáveis Seguras**: Configuração de ambiente protegida
5. **RBAC**: Controle de acesso baseado em funções
6. **HTTPS**: Obrigatório em produção
7. **Logs de Auditoria**: Winston com rotação diária
8. **Scan de Vulnerabilidades**: Verificação automática
9. **Headers de Segurança**: Helmet configurado
10. **CORS Restritivo**: Configuração de domínios permitidos
11. **MFA**: Autenticação multifatorial para admins
12. **Azure Key Vault**: Gerenciamento seguro de segredos
13. **CI/CD Seguro**: Pipeline com verificações de segurança
14. **Monitoramento**: Alertas de segurança em tempo real

### 🔍 **Verificação de Segurança**
```bash
# Executar verificação completa de segurança
npm run security:full-check

# Score de segurança do sistema
npm run security:check
```

---

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 18+
- PostgreSQL 13+
- Docker (opcional)
- Azure CLI (para deploy)

### **1. Clone e Instalação**
```bash
# Clonar repositório
git clone <repository-url>
cd SystemAgro

# Instalar todas as dependências
npm run install:all

# Instalar dependências de segurança
npm run install:security
```

### **2. Configuração de Ambiente**
```bash
# Criar arquivo de ambiente
npm run setup:env

# Editar configurações no .env
# Configure as variáveis seguindo o .env.example
```

### **3. Configuração do Banco de Dados**
```bash
# Navegar para o backend
cd backend

# Executar migrações
npx prisma migrate dev

# Executar seed (dados iniciais)
npx prisma db seed
```

### **4. Iniciar em Desenvolvimento**
```bash
# Voltar para raiz do projeto
cd ..

# Iniciar frontend e backend simultaneamente
npm run dev
```

### **5. Verificação de Segurança**
```bash
# Verificar configuração de segurança
npm run security:check

# Validar configurações do sistema
npm run config:validate
```

---

## 🐳 **Deploy com Docker**

### **Desenvolvimento Local**
```bash
# Construir e iniciar containers
npm run docker:build
npm run docker:up

# Verificar logs
npm run docker:logs

# Parar containers
npm run docker:down
```

### **Deploy Seguro para Azure**
```bash
# Deploy com verificações de segurança
npm run deploy:azure:secure

# Deploy básico
npm run deploy:azure
```

---

## 🛠️ **Scripts Disponíveis**

### **Desenvolvimento**
```bash
npm run dev              # Iniciar desenvolvimento (frontend + backend)
npm run dev:backend      # Iniciar apenas backend
npm run dev:frontend     # Iniciar apenas frontend
npm run build            # Build de produção
```

### **Segurança**
```bash
npm run security:check        # Verificação completa de segurança
npm run security:audit        # Auditoria de dependências
npm run security:lint         # Verificação de código
npm run security:report       # Gerar relatório de segurança
npm run security:dashboard    # Dashboard de métricas
```

### **Deploy e Monitoramento**
```bash
npm run deploy:azure          # Deploy para Azure
npm run azure:test           # Testar conexão Azure
npm run logs:tail            # Logs em tempo real
npm run system:health        # Status do sistema
npm run monitor:realtime     # Monitoramento ao vivo
```

### **Utilitários**
```bash
npm run config:validate      # Validar configurações
npm run compliance:report    # Relatório de compliance
npm run auth:reset-tokens    # Instruções para reset de tokens
npm run perf:test           # Teste de performance
```

---

## 📊 **Acessos do Sistema**

### **URLs de Desenvolvimento**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação API**: http://localhost:3001/api-docs
- **Dashboard de Segurança**: http://localhost:3001/api/security/dashboard

### **Usuários Padrão** (desenvolvimento)
```
Administrador:
- Email: admin@sistema-agro.com
- Senha: Admin123!

Usuário:
- Email: user@sistema-agro.com
- Senha: User123!
```

---

## 🏗️ **Arquitetura do Sistema**

### **Frontend (React + TypeScript)**
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── context/       # Contextos (Auth, Theme)
├── utils/         # Utilitários e helpers
└── App.tsx        # Componente principal
```

### **Backend (Node.js + Express)**
```
src/
├── routes/        # Rotas da API REST
├── middleware/    # Middlewares de segurança
├── utils/         # Utilitários e helpers
├── lib/           # Configurações (Prisma)
└── server.ts      # Servidor principal
```

### **Infraestrutura**
```
SystemAgro/
├── backend/       # API Node.js + Express
├── frontend/      # React + TypeScript
├── docs/          # Documentação
├── scripts/       # Scripts de automação
└── .github/       # CI/CD workflows
```

---

## 🔒 **Documentação de Segurança**

### **Documentos Principais**
- [**Segurança Completa**](./docs/SEGURANCA_COMPLETA.md) - Documentação completa de segurança
- [**Azure Security Benchmark**](./docs/SEGURANCA_COMPLETA.md#7-compliance-e-auditoria) - Compliance v3
- [**Procedimentos Operacionais**](./docs/SEGURANCA_COMPLETA.md#6-procedimentos-operacionais) - Deploy e manutenção

### **Verificações Automatizadas**
- **Pipeline CI/CD**: `.github/workflows/security-check.yml`
- **Script de Verificação**: `scripts/security-check.js`
- **Deploy Seguro**: `scripts/azure-deploy.js`

---

## 📈 **Monitoramento e Logs**

### **Logs Disponíveis**
```bash
# Logs de auditoria
tail -f backend/logs/audit-*.log

# Logs de segurança
tail -f backend/logs/security-*.log

# Logs combinados
npm run logs:tail
```

### **Métricas de Segurança**
- Tentativas de login falhadas
- Atividade suspeita de IP
- Taxa de erro do sistema
- Performance da aplicação

---

## 🤝 **Contribuição**

### **Padrões de Desenvolvimento**
1. Use **TypeScript** em todos os arquivos
2. Implemente **testes unitários** para novas funcionalidades
3. Siga as **convenções de nomenclatura** do projeto
4. Execute **verificações de segurança** antes de commit

### **Processo de Contribuição**
```bash
# 1. Fork do repositório
# 2. Criar branch para feature
git checkout -b feature/nova-funcionalidade

# 3. Desenvolver e testar
npm run test
npm run security:check

# 4. Commit com mensagem descritiva
git commit -m "feat: adicionar nova funcionalidade de cultivos"

# 5. Push e Pull Request
git push origin feature/nova-funcionalidade
```

---

## 📞 **Suporte e Contato**

### **Documentação Técnica**
- [Documentação Completa](./docs/)
- [API Documentation](http://localhost:3001/api-docs)
- [Segurança](./docs/SEGURANCA_COMPLETA.md)

### **Contatos**
- **Email**: suporte@sistema-agro.com
- **Segurança**: security@sistema-agro.com
- **Emergência**: emergency@sistema-agro.com

---

## 📄 **Licença**

Este projeto está licenciado sob a **MIT License**.

---

**🔒 Sistema desenvolvido seguindo as melhores práticas de segurança**  
**🌾 Para o agronegócio brasileiro**  
**⚡ Powered by React, Node.js e Azure**
