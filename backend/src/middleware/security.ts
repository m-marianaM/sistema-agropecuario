import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import { logger, auditLogger, securityLogger } from '../utils/logger';

/**
 * Configuração de Headers de Segurança HTTP
 * Implementa Azure Security Benchmark controles SC-7, SC-8
 */
export const securityHeaders = helmet({
  // Content Security Policy - Previne XSS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HSTS - Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  
  // Previne clickjacking
  frameguard: { action: 'deny' },
  
  // Previne MIME type sniffing
  noSniff: true,
  
  // Remove header X-Powered-By
  hidePoweredBy: true,
  
  // Controle de referrer
  referrerPolicy: { policy: 'same-origin' },
  
  // Permissões de API
  permittedCrossDomainPolicies: false,
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Download de arquivos
  ieNoOpen: true,
});

/**
 * Rate Limiting - Proteção contra DDoS e Brute Force
 * Implementa Azure Security Benchmark controle SC-5
 */
export const createRateLimit = () => {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      securityLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      res.status(429).json({
        error: 'Muitas requisições. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      });
    },
    skip: (req: Request) => {
      // Pular rate limiting para health checks
      return req.url === '/health' || req.url === '/metrics';
    }
  });
};

/**
 * Rate Limiting Específico para Login - Extra Proteção
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    securityLogger.warn('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Configuração CORS Restritiva
 * Implementa Azure Security Benchmark controle SC-7
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Permite requests sem origin em desenvolvimento (Postman, etc.)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin!)) {
      callback(null, true);
    } else {
      securityLogger.warn('CORS blocked request', {
        origin,
        timestamp: new Date().toISOString()
      });
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token']
});

/**
 * Middleware de Sanitização de Entrada
 * Previne XSS e injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitizar query params
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitizar params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    securityLogger.error('Input sanitization error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.status(400).json({
      error: 'Dados de entrada inválidos',
      code: 'INVALID_INPUT',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Função auxiliar para sanitizar objetos recursivamente
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj).trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware de Validação de Entrada
 * Valida dados usando express-validator
 */
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    securityLogger.warn('Input validation failed', {
      errors: errorDetails,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Middleware de Log de Auditoria
 * Registra eventos sensíveis para compliance
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capturar resposta original
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log para rotas sensíveis
    const sensitiveRoutes = ['/auth', '/users', '/admin', '/api/usuarios'];
    const isSensitive = sensitiveRoutes.some(route => req.url.includes(route));
    
    if (isSensitive || res.statusCode >= 400) {
      auditLogger.info('API Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        timestamp: new Date().toISOString(),
        sensitive: isSensitive
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware de Força HTTPS
 * Redireciona HTTP para HTTPS em produção
 */
export const forceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
    securityLogger.warn('HTTP request blocked - redirecting to HTTPS', {
      url: req.url,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return res.redirect(`https://${req.get('Host')}${req.url}`);
  }
  
  next();
};

/**
 * Middleware de Detecção de Ataques
 * Detecta padrões suspeitos nas requisições
 */
export const attackDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(<script|javascript:|data:)/i,
    /(union|select|insert|update|delete|drop|create|alter)/i,
    /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\)/i,
    /(\||&|;|\$\()/,
    /(exec|eval|system|cmd)/i
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (isSuspicious) {
    securityLogger.error('Suspicious request detected', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestData: requestData.substring(0, 1000), // Limitar tamanho do log
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      error: 'Requisição bloqueada por razões de segurança',
      code: 'SUSPICIOUS_REQUEST',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export default {
  securityHeaders,
  createRateLimit,
  loginRateLimit,
  corsConfig,
  sanitizeInput,
  validateInput,
  auditMiddleware,
  forceHTTPS,
  attackDetection
};
