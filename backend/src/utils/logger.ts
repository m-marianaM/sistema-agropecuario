import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Criar diretório de logs se não existir
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Configuração de formato personalizado para logs
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      service: 'sistema-agropecuario',
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  })
);

/**
 * Configuração de transporte para rotação diária de logs
 */
const createDailyRotateTransport = (filename: string, level?: string) => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logDir, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    level: level,
    format: logFormat,
    auditFile: path.join(logDir, `${filename}-audit.json`)
  });
};

/**
 * Logger principal da aplicação
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'sistema-agropecuario',
    component: 'main'
  },
  transports: [
    // Console para desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'test'
    }),
    
    // Arquivo principal
    createDailyRotateTransport('app'),
    
    // Arquivo apenas para erros
    createDailyRotateTransport('error', 'error')
  ],
  
  // Lidar com exceções não capturadas
  exceptionHandlers: [
    createDailyRotateTransport('exceptions')
  ],
  
  // Lidar com promises rejeitadas
  rejectionHandlers: [
    createDailyRotateTransport('rejections')
  ]
});

/**
 * Logger específico para auditoria
 * Registra eventos importantes para compliance
 */
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
        logType: 'AUDIT',
        service: 'sistema-agropecuario',
        compliance: 'Azure-Security-Benchmark-v3'
      });
    })
  ),
  transports: [
    createDailyRotateTransport('audit'),
    
    // Console em desenvolvimento
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, message, ...meta }) => {
            return `🔍 AUDIT [${timestamp}]: ${message} ${JSON.stringify(meta)}`;
          })
        )
      })
    ] : [])
  ]
});

/**
 * Logger específico para eventos de segurança
 * Monitora tentativas de acesso, falhas de autenticação, etc.
 */
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message: String(message),
        ...meta,
        logType: 'SECURITY',
        service: 'sistema-agropecuario',
        alertLevel: getSecurityAlertLevel(String(message), meta)
      });
    })
  ),
  transports: [
    createDailyRotateTransport('security'),
    
    // Console em desenvolvimento
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, message, level, ...meta }) => {
            const emoji = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : '🔒';
            return `${emoji} SECURITY [${timestamp}]: ${message} ${JSON.stringify(meta)}`;
          })
        )
      })
    ] : [])
  ]
});

/**
 * Determina o nível de alerta de segurança
 */
function getSecurityAlertLevel(message: string, meta: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const criticalPatterns = [
    'SQL injection',
    'Authentication bypass',
    'Privilege escalation',
    'Data breach'
  ];
  
  const highPatterns = [
    'Multiple failed login',
    'Suspicious request',
    'Rate limit exceeded',
    'Unauthorized access'
  ];
  
  const mediumPatterns = [
    'Failed login',
    'Invalid token',
    'CORS blocked',
    'Validation failed'
  ];
  
  const messageStr = `${message} ${JSON.stringify(meta)}`.toLowerCase();
  
  if (criticalPatterns.some(pattern => messageStr.includes(pattern.toLowerCase()))) {
    return 'CRITICAL';
  }
  
  if (highPatterns.some(pattern => messageStr.includes(pattern.toLowerCase()))) {
    return 'HIGH';
  }
  
  if (mediumPatterns.some(pattern => messageStr.includes(pattern.toLowerCase()))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

/**
 * Logger para métricas de performance
 */
export const metricsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    createDailyRotateTransport('metrics')
  ]
});

/**
 * Funções utilitárias para logging estruturado
 */
export const logUtils = {
  /**
   * Log de autenticação
   */
  logAuth: (action: string, userId: string, success: boolean, meta: any = {}) => {
    const logData = {
      action,
      userId,
      success,
      ip: meta.ip,
      userAgent: meta.userAgent,
      timestamp: new Date().toISOString(),
      ...meta
    };
    
    if (success) {
      auditLogger.info(`Authentication ${action}`, logData);
    } else {
      securityLogger.warn(`Authentication ${action} failed`, logData);
    }
  },

  /**
   * Log de acesso a dados sensíveis
   */
  logDataAccess: (userId: string, resource: string, action: string, meta: any = {}) => {
    auditLogger.info('Data access', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },

  /**
   * Log de mudanças administrativas
   */
  logAdminAction: (userId: string, action: string, target: string, meta: any = {}) => {
    auditLogger.info('Administrative action', {
      userId,
      action,
      target,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },

  /**
   * Log de erro de segurança
   */
  logSecurityError: (error: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', meta: any = {}) => {
    securityLogger.error('Security error', {
      error,
      severity,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },

  /**
   * Log de performance
   */
  logPerformance: (operation: string, duration: number, meta: any = {}) => {
    metricsLogger.info('Performance metric', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },

  /**
   * Log de upload de arquivo
   */
  logFileUpload: (userId: string, filename: string, size: number, type: string, meta: any = {}) => {
    auditLogger.info('File upload', {
      userId,
      filename,
      size,
      type,
      timestamp: new Date().toISOString(),
      ...meta
    });
  },

  /**
   * Log de export de dados
   */
  logDataExport: (userId: string, dataType: string, recordCount: number, meta: any = {}) => {
    auditLogger.info('Data export', {
      userId,
      dataType,
      recordCount,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }
};

/**
 * Middleware para logging automático de requisições
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

/**
 * Configuração de monitoramento de logs
 */
export const setupLogMonitoring = () => {
  // Monitorar erros não capturados
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
  });
  
  // Log de inicialização
  logger.info('Application started', {
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString()
  });
};

export default {
  logger,
  auditLogger,
  securityLogger,
  metricsLogger,
  logUtils,
  requestLogger,
  setupLogMonitoring
};
