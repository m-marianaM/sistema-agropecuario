/**
 * Servidor principal do Sistema Agropecuário
 * Configura Express, middlewares, rotas e conexão com banco de dados
 * 
 * Versão: 2.0.0 - Integração de Cultivos Completa
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Importa as rotas da aplicação
import fazendaRoutes from './routes/fazendaRoutes';
import cultivoRoutes from './routes/cultivoRoutes';
import aduboRoutes from './routes/aduboRoutes';
import vendaRoutes from './routes/vendaRoutes';
import estoqueRoutes from './routes/estoqueRoutes';
import newAuthRoutes from './routes/newAuthRoutes';
import importRoutes from './routes/importRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Cria instância principal do Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuração completa do Swagger para documentação automática da API
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroSystem API',
      version: '1.0.0',
      description: 'API REST para gestão completa de fazendas, cultivos, vendas e estoque agropecuário',
      contact: {
        name: 'AgroSystem',
        email: 'contato@systemagro.com',
        url: 'https://systemagro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento local'
      },
      {
        url: `https://api.systemagro.com`,
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação do usuário'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'] // Caminho para arquivos de rota com documentação Swagger
};

// Gera especificação Swagger a partir das configurações
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configuração de rate limiting para proteção contra ataques DDoS e spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 100, // Máximo 100 requests por IP por janela
  message: {
    error: 'Muitas solicitações deste IP',
    message: 'Tente novamente em 15 minutos',
    retryAfter: 15 * 60 // Tempo em segundos
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Pula rate limiting para health check e documentação
    return req.path === '/health' || req.path.startsWith('/api-docs');
  }
});

// ========================
// MIDDLEWARES DE SEGURANÇA
// ========================

app.use(helmet({
  // Configurações específicas do Helmet para segurança
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Permite inline styles para Swagger UI
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false // Desabilita para compatibilidade com Swagger UI
}));

app.use(compression()); // Comprime respostas HTTP para melhor performance
app.use(limiter); // Aplica rate limiting global
app.use(morgan('combined')); // Log detalhado de todas as requisições HTTP

// ========================
// CONFIGURAÇÃO DE CORS
// ========================

app.use(cors({
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:3000', // Frontend local
      'http://localhost:3001', // Backend local
      'https://systemagro.com', // Produção
      'https://app.systemagro.com' // App produção
    ];
    
    // Permite requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true, // Permite cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  maxAge: 86400 // Cache preflight por 24 horas
}));

// ========================
// MIDDLEWARES DE PARSING
// ========================

app.use(express.json({ 
  limit: '10mb', // Limite para JSON (importante para uploads)
  strict: true, // Aceita apenas arrays e objects como JSON válido
  type: ['application/json', 'text/plain'] // Aceita diferentes tipos de conteúdo
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 // Limite de parâmetros URL
}));

// Configuração explícita para UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ========================
// DOCUMENTAÇÃO DA API
// ========================

// Serve documentação Swagger UI na rota /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'AgroSystem API',
  customCss: '.swagger-ui .topbar { display: none }', // Remove barra superior
  swaggerOptions: {
    persistAuthorization: true, // Mantém token JWT entre reloads
    displayRequestDuration: true, // Mostra tempo de resposta
    filter: true, // Permite filtrar endpoints
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Endpoint para obter spec JSON da API (útil para integração)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========================
// ROTAS DE SISTEMA
// ========================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica saúde do sistema
 *     description: Endpoint para monitoramento e health check do servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Sistema funcionando normalmente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tempo de atividade em segundos
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    pid: process.pid
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da API
 *     description: Informações básicas sobre a API do Sistema Agropecuário
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Informações da API
 */
app.get('/', (req, res) => {
  res.json({
    name: 'AgroSystem API',
    version: '1.0.0',
    description: 'API REST para gestão completa de fazendas e agropecuária',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health: `${req.protocol}://${req.get('host')}/health`,
    endpoints: {
      auth: '/api/auth',
      fazendas: '/api/fazendas',
      cultivos: '/api/cultivos',
      adubos: '/api/adubos',
      vendas: '/api/vendas',
      estoque: '/api/estoque',
      import: '/api/import',
      dashboard: '/api/dashboard'
    }
  });
});

// ========================
// CONFIGURAÇÃO DAS ROTAS DA API
// ========================

// Rotas de autenticação (login, registro, verificação JWT)
app.use('/api/auth', newAuthRoutes);

// Rotas para gestão de fazendas (CRUD completo)
app.use('/api/fazendas', fazendaRoutes);

// Rotas para gestão de cultivos (plantio, crescimento, colheita)
app.use('/api/cultivos', cultivoRoutes);

// Rotas para controle de adubos e fertilizantes
app.use('/api/adubos', aduboRoutes);

// Rotas para gestão de vendas e comercialização
app.use('/api/vendas', vendaRoutes);

// Rotas para controle de estoque (ração, fertilizantes, equipamentos)
app.use('/api/estoque', estoqueRoutes);

// Rotas para importação e exportação de dados via Excel
app.use('/api/import', importRoutes);

// Rotas para dados do dashboard BI (métricas agregadas)
app.use('/api/dashboard', dashboardRoutes);

// ========================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ========================

// Middleware para capturar rotas não encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    message: `A rota ${req.method} ${req.originalUrl} não existe nesta API`,
    suggestion: 'Consulte a documentação em /api-docs para rotas disponíveis',
    timestamp: new Date().toISOString()
  });
});

// Middleware global de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log do erro para debug
  console.error('🚨 Erro na aplicação:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determina código de status baseado no tipo de erro
  let statusCode = err.status || err.statusCode || 500;
  
  // Trata erros específicos
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (err.name === 'CastError') {
    statusCode = 400;
  }

  // Resposta de erro padronizada
  const errorResponse: any = {
    success: false,
    error: statusCode >= 500 ? 'Erro interno do servidor' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Adiciona stack trace apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    (errorResponse as any).stack = err.stack;
    (errorResponse as any).details = err;
  }

  res.status(statusCode).json(errorResponse);
});

// ========================
// INICIALIZAÇÃO DO SERVIDOR
// ========================

// Função para inicializar o servidor
const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log('🚀 ============================================');
      console.log('🌾 AGROSYSTEM - SERVIDOR INICIADO');
      console.log('🚀 ============================================');
      console.log(`📍 Servidor rodando na porta: ${PORT}`);
      console.log(`🌐 URL local: http://localhost:${PORT}`);
      console.log(`📚 Documentação da API: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
      console.log('🚀 ============================================');
    });

    // Configuração para graceful shutdown
    process.on('SIGTERM', () => {
      console.log('💤 Recebido SIGTERM. Encerrando servidor graciosamente...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('💤 Recebido SIGINT. Encerrando servidor graciosamente...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Inicia o servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

// Exporta a aplicação para testes e outros módulos
export default app;
