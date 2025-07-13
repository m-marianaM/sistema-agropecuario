import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { securityHeaders, createRateLimit, corsConfig, sanitizeInput, validateInput, auditMiddleware, forceHTTPS, attackDetection } from './middleware/security';
import { authenticateToken, authorize } from './middleware/auth-secure';
import { logger, setupLogMonitoring, requestLogger } from './utils/logger';

/**
 * Configuração segura do servidor Express
 * Implementa Azure Security Benchmark v3
 */
export class SecureServer {
  private app: express.Application;
  private server: http.Server | https.Server | null = null;

  constructor() {
    this.app = express();
    this.setupSecurity();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configuração de segurança principal
   */
  private setupSecurity(): void {
    // Force HTTPS em produção
    if (process.env.NODE_ENV === 'production') {
      this.app.use(forceHTTPS);
    }

    // Headers de segurança HTTP
    this.app.use(securityHeaders);

    // Rate limiting global
    this.app.use(createRateLimit());

    // CORS restritivo
    this.app.use(corsConfig);

    // Detecção de ataques
    this.app.use(attackDetection);

    // Sanitização de entrada
    this.app.use(sanitizeInput);

    // Middleware de auditoria
    this.app.use(auditMiddleware);

    // Logger de requisições
    this.app.use(requestLogger);

    // Body parsing com limites de segurança
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Verificar se o payload é válido JSON
        try {
          JSON.parse(buf.toString());
        } catch (e) {
          throw new Error('JSON inválido');
        }
      }
    }));

    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb',
      parameterLimit: 100 // Limitar número de parâmetros
    }));

    // Trust proxy para headers corretos atrás de load balancer
    if (process.env.NODE_ENV === 'production') {
      this.app.set('trust proxy', 1);
    }

    logger.info('Security middleware configured');
  }

  /**
   * Configuração de middleware da aplicação
   */
  private setupMiddleware(): void {
    // Health check endpoint - sem autenticação
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Metrics endpoint - protegido
    this.app.get('/metrics', authenticateToken, authorize(['admin']), (req, res) => {
      // Implementar métricas do Prometheus aqui
      res.status(200).send('# Metrics endpoint');
    });

    logger.info('Application middleware configured');
  }

  /**
   * Configuração de rotas da aplicação
   */
  private setupRoutes(): void {
    // Importar e configurar rotas aqui
    // this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/fazendas', authenticateToken, fazendaRoutes);
    // etc.

    // Rota padrão para SPA
    this.app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          error: 'Endpoint não encontrado',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        });
      }
      
      // Servir frontend em produção
      if (process.env.NODE_ENV === 'production') {
        const frontendPath = path.join(__dirname, '../../frontend/build/index.html');
        if (fs.existsSync(frontendPath)) {
          res.sendFile(frontendPath);
        } else {
          res.status(404).send('Frontend não encontrado');
        }
      } else {
        res.status(404).json({
          error: 'Página não encontrada',
          code: 'NOT_FOUND'
        });
      }
    });

    logger.info('Routes configured');
  }

  /**
   * Configuração de tratamento de erros
   */
  private setupErrorHandling(): void {
    // Middleware de tratamento de erros global
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
      });

      // Não vazar informações sensíveis em produção
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(error.status || 500).json({
        error: isDevelopment ? error.message : 'Erro interno do servidor',
        code: error.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { stack: error.stack })
      });
    });

    // Middleware para rotas não encontradas
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Rota não encontrada',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    });

    logger.info('Error handling configured');
  }

  /**
   * Carrega certificados SSL
   */
  private loadSSLCertificates(): { key: Buffer; cert: Buffer } | null {
    try {
      const keyPath = process.env.SSL_KEY_PATH || './certs/key.pem';
      const certPath = process.env.SSL_CERT_PATH || './certs/cert.pem';

      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        logger.warn('SSL certificates not found, using HTTP in development');
        return null;
      }

      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    } catch (error) {
      logger.error('Error loading SSL certificates', { error });
      return null;
    }
  }

  /**
   * Inicia o servidor
   */
  public start(): void {
    const port = parseInt(process.env.PORT || '3001');
    const httpsEnabled = process.env.HTTPS_ENABLED === 'true';

    // Configurar monitoramento de logs
    setupLogMonitoring();

    if (httpsEnabled && process.env.NODE_ENV === 'production') {
      const sslOptions = this.loadSSLCertificates();
      
      if (sslOptions) {
        this.server = https.createServer(sslOptions, this.app);
        this.server.listen(port, () => {
          logger.info(`🔒 Secure HTTPS server started on port ${port}`);
        });

        // Redirecionar HTTP para HTTPS
        const httpRedirectServer = http.createServer((req, res) => {
          res.writeHead(301, {
            Location: `https://${req.headers.host}${req.url}`
          });
          res.end();
        });

        httpRedirectServer.listen(80, () => {
          logger.info('🔄 HTTP to HTTPS redirect server started on port 80');
        });
      } else {
        logger.warn('HTTPS requested but certificates not found, falling back to HTTP');
        this.startHTTP(port);
      }
    } else {
      this.startHTTP(port);
    }

    // Graceful shutdown
    this.setupGracefulShutdown();
  }

  /**
   * Inicia servidor HTTP
   */
  private startHTTP(port: number): void {
    this.server = http.createServer(this.app);
    this.server.listen(port, () => {
      logger.info(`🌐 HTTP server started on port ${port}`);
      
      if (process.env.NODE_ENV === 'production') {
        logger.warn('⚠️ Running HTTP in production - consider enabling HTTPS');
      }
    });
  }

  /**
   * Configuração de graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            logger.error('Error during server close', { error: err.message });
            process.exit(1);
          }
          
          logger.info('Server closed successfully');
          process.exit(0);
        });

        // Force close after 30 seconds
        setTimeout(() => {
          logger.error('Forced shutdown after 30 seconds');
          process.exit(1);
        }, 30000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Retorna a instância do app Express
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Configuração de CSP personalizada para rotas específicas
export const cspForAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );
  next();
};

// Middleware de verificação de integridade
export const integrityCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Verificar integridade da requisição
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      error: 'Payload muito grande',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  next();
};

export default SecureServer;
