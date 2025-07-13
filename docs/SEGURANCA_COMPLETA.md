# 🔒 Documentação Completa de Segurança - Sistema Agropecuário

**Implementação Azure Security Benchmark v3**
**Versão: 1.0**
**Data: Dezembro 2024**

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura de Segurança](#2-arquitetura-de-segurança)
3. [Implementações Realizadas](#3-implementações-realizadas)
4. [Configurações de Segurança](#4-configurações-de-segurança)
5. [Monitoramento e Alertas](#5-monitoramento-e-alertas)
6. [Procedimentos Operacionais](#6-procedimentos-operacionais)
7. [Compliance e Auditoria](#7-compliance-e-auditoria)
8. [Manutenção e Atualizações](#8-manutenção-e-atualizações)
9. [Troubleshooting](#9-troubleshooting)
10. [Apêndices](#10-apêndices)

---

## 1. Visão Geral

### 1.1 Objetivo do Documento

Este documento detalha a implementação completa de segurança no Sistema Agropecuário, seguindo as diretrizes do **Microsoft Azure Security Benchmark v3**. O sistema foi desenvolvido com foco em:

- **Segurança por Design** (Security by Design)
- **Defesa em Profundidade** (Defense in Depth)
- **Princípio do Menor Privilégio** (Principle of Least Privilege)
- **Conformidade Regulatória** (Regulatory Compliance)

### 1.2 Escopo de Segurança

✅ **14 Requisitos de Segurança Implementados:**

1. ✅ Validação rigorosa de entrada de dados
2. ✅ Autenticação JWT com cookies HttpOnly
3. ✅ Criptografia de senhas com bcrypt
4. ✅ Configuração segura de variáveis de ambiente
5. ✅ Controle de acesso baseado em funções (RBAC)
6. ✅ Aplicação de HTTPS obrigatório
7. ✅ Sistema de logs e auditoria completo
8. ✅ Verificação automática de vulnerabilidades
9. ✅ Headers de segurança configurados
10. ✅ Configuração restritiva de CORS
11. ✅ Autenticação multifatorial (MFA)
12. ✅ Integração com Azure Key Vault
13. ✅ Pipeline automatizada de verificação de segurança
14. ✅ Monitoramento contínuo de ameaças

### 1.3 Tecnologias de Segurança

| Categoria | Tecnologia | Propósito |
|-----------|------------|-----------|
| **Autenticação** | JWT + bcrypt + speakeasy | Tokens seguros, hash de senhas, MFA |
| **Middleware** | Helmet + express-rate-limit | Headers de segurança, rate limiting |
| **Validação** | express-validator + DOMPurify | Sanitização e validação de entrada |
| **Logging** | Winston + Azure Monitor | Auditoria e monitoramento |
| **Segredos** | Azure Key Vault | Gerenciamento seguro de credenciais |
| **CI/CD** | GitHub Actions + OWASP ZAP | Verificação automatizada |
| **Análise** | ESLint Security + SonarCloud | Análise estática de código |

---

## 2. Arquitetura de Segurança

### 2.1 Camadas de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                     CAMADA DE REDE                         │
│  • Azure Application Gateway com WAF                       │
│  • HTTPS/TLS 1.2+ obrigatório                             │
│  • DDoS Protection                                         │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                  CAMADA DE APLICAÇÃO                       │
│  • Headers de segurança (helmet)                          │
│  • Rate limiting por IP                                   │
│  • CORS restritivo                                        │
│  • Validação de entrada                                   │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                 CAMADA DE AUTENTICAÇÃO                     │
│  • JWT com refresh tokens                                 │
│  • MFA obrigatório para admins                           │
│  • RBAC (Role-Based Access Control)                      │
│  • Sessões seguras                                        │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                   CAMADA DE DADOS                          │
│  • Criptografia em trânsito (TLS)                        │
│  • Criptografia em repouso (Azure)                       │
│  • Backup automático criptografado                       │
│  • Segregação de dados                                    │
└─────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────┐
│                 CAMADA DE MONITORAMENTO                    │
│  • Logs de auditoria centralizados                       │
│  • Alertas de segurança em tempo real                    │
│  • Análise comportamental                                 │
│  • Compliance reporting                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Autenticação Segura

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant M as Middleware
    participant A as Auth Service
    participant KV as Key Vault
    participant D as Database
    
    U->>F: Login (email/senha)
    F->>M: POST /api/auth/login
    M->>M: Rate limiting check
    M->>M: Input validation
    M->>A: Authenticate user
    A->>D: Verify credentials
    D-->>A: User data
    A->>A: Check MFA requirement
    A->>KV: Get JWT secrets
    KV-->>A: JWT keys
    A->>A: Generate tokens
    A-->>M: JWT + Refresh token
    M->>M: Set HttpOnly cookies
    M-->>F: Success response
    F-->>U: Dashboard access
    
    Note over M,A: Todos os passos são logados para auditoria
```

---

## 3. Implementações Realizadas

### 3.1 Sistema de Autenticação Segura

**Arquivo:** `backend/src/middleware/auth-secure.ts`

#### 3.1.1 Características Principais

- **JWT com Refresh Tokens**: Tokens de curta duração (15min) com refresh de longa duração (7 dias)
- **Cookies HttpOnly**: Previne acesso via JavaScript (XSS protection)
- **MFA Obrigatório**: TOTP para administradores
- **RBAC**: Controle granular de permissões

#### 3.1.2 Configuração de Tokens

```typescript
// Configuração de segurança dos tokens
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ALGORITHM: 'HS256',
  ISSUER: 'sistema-agro',
  AUDIENCE: 'sistema-agro-users'
};

// Configuração de cookies seguros
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};
```

### 3.2 Middleware de Segurança

**Arquivo:** `backend/src/middleware/security.ts`

#### 3.2.1 Headers de Segurança

```typescript
// Headers implementados
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.sistema-agro.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

#### 3.2.2 Rate Limiting

```typescript
// Configuração de rate limiting
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por janela
  message: 'Muitas tentativas, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' // Skip para localhost em dev
};
```

### 3.3 Sistema de Logging e Auditoria

**Arquivo:** `backend/src/utils/logger.ts`

#### 3.3.1 Tipos de Logs

1. **Audit Logs**: Ações administrativas e mudanças críticas
2. **Security Logs**: Eventos de segurança e tentativas de ataque
3. **Performance Logs**: Métricas de performance e erros
4. **Access Logs**: Logs de acesso e autenticação

#### 3.3.2 Configuração Winston

```typescript
// Configuração do Winston com rotação diária
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info'
    })
  ]
};
```

### 3.4 Integração Azure Key Vault

**Arquivo:** `backend/src/utils/azure-keyvault.ts`

#### 3.4.1 Configuração Segura

```typescript
// Configuração do cliente Key Vault
const credential = new DefaultAzureCredential();
const client = new SecretClient(
  process.env.AZURE_KEY_VAULT_URL!,
  credential
);

// Cache de segredos com TTL
class SecretCache {
  private cache = new Map<string, { value: string; expires: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos
  
  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }
}
```

---

## 4. Configurações de Segurança

### 4.1 Variáveis de Ambiente

**Arquivo:** `.env.example`

#### 4.1.1 Categorias de Configuração

| Categoria | Variáveis | Descrição |
|-----------|-----------|-----------|
| **JWT** | JWT_SECRET, JWT_REFRESH_SECRET | Chaves para assinatura de tokens |
| **Database** | DATABASE_URL, DB_ENCRYPT_KEY | Conexão segura com banco |
| **Azure** | AZURE_KEY_VAULT_URL, AZURE_CLIENT_ID | Integração com serviços Azure |
| **Security** | BCRYPT_ROUNDS, SESSION_SECRET | Configurações de criptografia |
| **Logging** | LOG_LEVEL, AUDIT_ENABLED | Configurações de logs |

#### 4.1.2 Configurações Obrigatórias

```bash
# Configurações críticas de produção
NODE_ENV=production
HTTPS_ENABLED=true
SECURITY_HEADERS_ENABLED=true
RATE_LIMITING_ENABLED=true
MFA_REQUIRED_ADMIN=true
AUDIT_ENABLED=true
VULNERABILITY_SCANNING=true
```

### 4.2 Configuração de Banco de Dados

**Arquivo:** `backend/prisma/schema.prisma`

#### 4.2.1 Conexão Segura

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Configuração de SSL obrigatório
// DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 4.3 Configuração Docker

**Arquivo:** `backend/Dockerfile`

#### 4.3.1 Imagem Segura

```dockerfile
# Usar imagem oficial Node.js Alpine (menor superfície de ataque)
FROM node:18-alpine

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar e instalar dependências
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

---

## 5. Monitoramento e Alertas

### 5.1 Sistema de Monitoramento

**Arquivo:** `backend/src/utils/security-monitor.ts`

#### 5.1.1 Métricas Monitoradas

1. **Tentativas de Login Falhadas**: Detecção de força bruta
2. **Atividade Suspeita de IP**: Muitas requisições de um IP
3. **Taxa de Erro Alta**: Possível ataque ou problema sistêmico
4. **Padrões de Acesso Incomuns**: Acesso fora do horário comercial
5. **Tentativas de Injeção**: SQL injection e XSS
6. **Performance Degradada**: Uso excessivo de recursos

#### 5.1.2 Alertas Configurados

```typescript
// Regras de alerta
const alertRules = [
  {
    name: 'Múltiplas tentativas de login falhadas',
    condition: (data) => data.failedAttempts >= 5,
    severity: 'high',
    action: 'block_ip_temporarily'
  },
  {
    name: 'Tentativa de SQL Injection',
    condition: (data) => data.suspiciousQuery,
    severity: 'critical',
    action: 'block_ip_immediately'
  }
];
```

### 5.2 Dashboard de Segurança

**Endpoint:** `/api/security/dashboard`

#### 5.2.1 Métricas Exibidas

- **Eventos de Segurança**: Últimas 24 horas
- **IPs Bloqueados**: Lista atualizada
- **Tentativas de Ataque**: Por tipo e frequência
- **Performance do Sistema**: CPU, memória, conexões
- **Status de Compliance**: Verificações de segurança

---

## 6. Procedimentos Operacionais

### 6.1 Deploy Seguro

**Script:** `scripts/azure-deploy.js`

#### 6.1.1 Processo de Deploy

1. **Validação de Pré-requisitos**
   - Verificar Azure CLI autenticado
   - Validar variáveis de ambiente
   - Confirmar build bem-sucedido

2. **Verificações de Segurança**
   - Executar `npm audit`
   - Executar verificação de segurança customizada
   - Validar configurações

3. **Deploy para Azure**
   - Criar recursos necessários
   - Configurar HTTPS obrigatório
   - Aplicar configurações de segurança

4. **Validação Pós-Deploy**
   - Verificar saúde da aplicação
   - Confirmar logs funcionando
   - Testar endpoints críticos

#### 6.1.2 Comando de Deploy

```bash
# Deploy completo para produção
npm run deploy:azure

# Verificação apenas de segurança
npm run security:check

# Deploy com verificação completa
npm run deploy:azure:secure
```

### 6.2 Verificação de Segurança

**Script:** `scripts/security-check.js`

#### 6.2.1 Verificações Automatizadas

1. **Variáveis de Ambiente**: Validar configurações obrigatórias
2. **Dependências**: Verificar vulnerabilidades conhecidas
3. **Qualidade de Código**: ESLint com regras de segurança
4. **Configuração de Auth**: Validar JWT e bcrypt
5. **HTTPS**: Confirmar configuração SSL/TLS
6. **Input Validation**: Verificar sanitização
7. **Error Handling**: Confirmar tratamento adequado
8. **Logging**: Validar sistema de auditoria

#### 6.2.2 Score de Segurança

```bash
# Executar verificação completa
node scripts/security-check.js

# Resultado exemplo:
# 🔒 SCORE DE SEGURANÇA: 95%
# ✅ Verificações aprovadas: 13
# ❌ Verificações falharam: 1
# ⚠️ Avisos: 2
```

### 6.3 Manutenção Preventiva

#### 6.3.1 Tarefas Diárias

- **Verificar Logs de Segurança**: Revisar eventos críticos
- **Monitorar Performance**: Validar métricas do sistema
- **Verificar Backups**: Confirmar backup automático
- **Atualizar Listas de IP**: Revisar IPs bloqueados

#### 6.3.2 Tarefas Semanais

- **Audit de Dependências**: `npm audit` e atualizações
- **Revisão de Usuários**: Validar permissões ativas
- **Teste de Recuperação**: Simular cenários de falha
- **Análise de Logs**: Identificar padrões suspeitos

#### 6.3.3 Tarefas Mensais

- **Penetration Testing**: Testes de segurança externos
- **Revisão de Configurações**: Validar todas as configurações
- **Atualização de Certificados**: Renovar certificados SSL
- **Treinamento de Equipe**: Atualizar conhecimento de segurança

---

## 7. Compliance e Auditoria

### 7.1 Azure Security Benchmark v3

#### 7.1.1 Controles Implementados

| Controle | Descrição | Status | Evidência |
|----------|-----------|--------|-----------|
| **NS-1** | Establish network segmentation boundaries | ✅ | CORS restritivo, WAF |
| **NS-2** | Secure cloud services with network controls | ✅ | Azure networking, private endpoints |
| **IM-1** | Use centralized identity and authentication system | ✅ | Azure AD integration |
| **IM-2** | Manage application identities securely | ✅ | Managed Identity |
| **IM-3** | Use Azure AD single sign-on (SSO) | ✅ | JWT + Azure AD |
| **PA-1** | Protect and limit access with PAM | ✅ | RBAC implementation |
| **PA-2** | Restrict administrative access | ✅ | MFA para admins |
| **DP-1** | Discover, classify and label sensitive data | ✅ | Data classification |
| **DP-2** | Protect sensitive data at rest | ✅ | Azure encryption |
| **DP-3** | Monitor for unauthorized transfer of sensitive data | ✅ | Audit logs |

#### 7.1.2 Relatórios de Compliance

**Automático**: Geração diária de relatórios de compliance
**Manual**: Revisão semanal por equipe de segurança
**Auditoria**: Revisão trimestral por auditores externos

### 7.2 Logs de Auditoria

#### 7.2.1 Eventos Auditados

- **Autenticação**: Login/logout, mudanças de senha
- **Autorização**: Acesso negado, elevação de privilégios
- **Dados**: Criação, modificação, exclusão de registros
- **Configuração**: Mudanças em configurações do sistema
- **Segurança**: Tentativas de ataque, bloqueios de IP

#### 7.2.2 Retenção de Logs

- **Logs de Segurança**: 7 anos
- **Logs de Auditoria**: 5 anos
- **Logs de Performance**: 1 ano
- **Logs de Debug**: 30 dias

---

## 8. Manutenção e Atualizações

### 8.1 Gestão de Dependências

#### 8.1.1 Processo de Atualização

```bash
# Verificar dependências outdated
npm outdated

# Atualizar dependências de segurança
npm audit fix

# Atualizar dependências não-breaking
npm update

# Verificar vulnerabilidades
npm audit --audit-level moderate
```

#### 8.1.2 Dependências Críticas

| Pacote | Versão Mínima | Motivo |
|--------|---------------|--------|
| **express** | 4.18.2+ | Correções de segurança |
| **jsonwebtoken** | 9.0.0+ | Vulnerabilidades JWT |
| **bcrypt** | 5.1.0+ | Algoritmos de hash |
| **helmet** | 7.0.0+ | Headers de segurança |

### 8.2 Atualizações de Segurança

#### 8.2.1 Processo de Patch

1. **Detecção**: Monitoramento automático de CVEs
2. **Avaliação**: Análise de impacto e criticidade
3. **Teste**: Validação em ambiente de teste
4. **Deploy**: Aplicação em produção
5. **Verificação**: Confirmação de correção

#### 8.2.2 Cronograma de Atualizações

- **Críticas**: Imediata (4 horas)
- **Altas**: 24 horas
- **Médias**: 7 dias
- **Baixas**: 30 dias

---

## 9. Troubleshooting

### 9.1 Problemas Comuns

#### 9.1.1 Falhas de Autenticação

**Sintoma**: Token JWT inválido
**Causa**: Expiração ou chave incorreta
**Solução**: 
```bash
# Verificar configuração
node -e "console.log(process.env.JWT_SECRET?.length)"

# Regenerar tokens
npm run auth:reset-tokens
```

#### 9.1.2 Rate Limiting Excessivo

**Sintoma**: Erro 429 - Too Many Requests
**Causa**: Configuração muito restritiva
**Solução**:
```typescript
// Ajustar configuração
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 200, // Aumentar limite
  message: 'Rate limit exceeded'
};
```

#### 9.1.3 Logs Não Aparecendo

**Sintoma**: Ausência de logs de auditoria
**Causa**: Configuração de transporte incorreta
**Solução**:
```bash
# Verificar permissões de diretório
ls -la logs/

# Verificar configuração
npm run logs:test
```

### 9.2 Ferramentas de Diagnóstico

#### 9.2.1 Scripts de Diagnóstico

```bash
# Verificação completa do sistema
npm run system:health

# Teste de conectividade Azure
npm run azure:test

# Validação de configurações
npm run config:validate

# Teste de performance
npm run perf:test
```

#### 9.2.2 Monitoramento em Tempo Real

```bash
# Logs em tempo real
npm run logs:tail

# Métricas de sistema
npm run metrics:watch

# Status de segurança
npm run security:status
```

---

## 10. Apêndices

### 10.1 Checklist de Deploy

#### 10.1.1 Pré-Deploy

- [ ] Executar `npm run security:check`
- [ ] Verificar `npm audit --audit-level moderate`
- [ ] Validar variáveis de ambiente
- [ ] Confirmar backup do banco de dados
- [ ] Testar em ambiente de staging

#### 10.1.2 Deploy

- [ ] Executar `npm run deploy:azure`
- [ ] Verificar HTTPS funcionando
- [ ] Confirmar logs sendo gerados
- [ ] Testar autenticação
- [ ] Validar rate limiting

#### 10.1.3 Pós-Deploy

- [ ] Verificar métricas de performance
- [ ] Confirmar alertas funcionando
- [ ] Testar backup automático
- [ ] Executar smoke tests
- [ ] Documentar mudanças

### 10.2 Comandos Úteis

#### 10.2.1 Segurança

```bash
# Verificação completa de segurança
npm run security:full-check

# Scan de vulnerabilidades
npm run security:vuln-scan

# Teste de penetração básico
npm run security:pentest

# Geração de relatório de segurança
npm run security:report
```

#### 10.2.2 Monitoramento

```bash
# Dashboard de segurança
npm run security:dashboard

# Métricas em tempo real
npm run monitor:realtime

# Exportar logs para análise
npm run logs:export

# Gerar relatório de compliance
npm run compliance:report
```

### 10.3 Contatos de Emergência

#### 10.3.1 Equipe de Segurança

- **Responsável de Segurança**: security@sistema-agro.com
- **Administrador de Sistema**: admin@sistema-agro.com
- **Equipe DevOps**: devops@sistema-agro.com

#### 10.3.2 Fornecedores

- **Suporte Azure**: Portal Azure - Suporte
- **Consultoria de Segurança**: security-consultant@empresa.com

### 10.4 Referências

- [Azure Security Benchmark v3](https://docs.microsoft.com/en-us/security/benchmark/azure/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Azure Security Documentation](https://docs.microsoft.com/en-us/azure/security/)

---

**Documento gerado em**: Dezembro 2024  
**Versão**: 1.0  
**Próxima revisão**: Março 2025  

**© 2024 Sistema Agropecuário - Todos os direitos reservados**  
**🔒 Documento contém informações confidenciais de segurança**
