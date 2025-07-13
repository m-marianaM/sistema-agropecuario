/**
 * Sistema de Monitoramento e Alertas
 * Azure Security Benchmark v3 Compliance
 */

import { Request, Response, NextFunction } from 'express';
import { auditLogger, securityLogger } from './logger';

// Logger de performance separado
const performanceLogger = {
  info: (message: string, data: any) => {
    console.log(`[PERFORMANCE] ${message}:`, data);
  }
};

// Interfaces
interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeConnections: number;
  timestamp: Date;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (value: any) => boolean;
  action: (data: any) => void;
  enabled: boolean;
  lastTriggered?: Date;
  cooldownMinutes: number;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alertRules: AlertRule[] = [];
  private metrics: Map<string, any> = new Map();
  private activeThreats: Set<string> = new Set();

  constructor() {
    this.initializeAlertRules();
    this.startMonitoring();
  }

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Inicializar regras de alerta
   */
  private initializeAlertRules() {
    this.alertRules = [
      {
        id: 'failed-login-attempts',
        name: 'Múltiplas tentativas de login falhadas',
        condition: (data) => data.failedAttempts >= 5,
        action: (data) => this.handleFailedLoginAlert(data),
        enabled: true,
        cooldownMinutes: 15
      },
      {
        id: 'suspicious-ip',
        name: 'Atividade suspeita de IP',
        condition: (data) => data.requestCount >= 100,
        action: (data) => this.handleSuspiciousIpAlert(data),
        enabled: true,
        cooldownMinutes: 30
      },
      {
        id: 'high-error-rate',
        name: 'Alta taxa de erros',
        condition: (data) => data.errorRate >= 0.1,
        action: (data) => this.handleHighErrorRateAlert(data),
        enabled: true,
        cooldownMinutes: 10
      },
      {
        id: 'unusual-access-pattern',
        name: 'Padrão de acesso incomum',
        condition: (data) => data.offHoursAccess && data.sensitiveResource,
        action: (data) => this.handleUnusualAccessAlert(data),
        enabled: true,
        cooldownMinutes: 60
      },
      {
        id: 'sql-injection-attempt',
        name: 'Tentativa de SQL Injection',
        condition: (data) => data.suspiciousQuery,
        action: (data) => this.handleSqlInjectionAlert(data),
        enabled: true,
        cooldownMinutes: 5
      },
      {
        id: 'xss-attempt',
        name: 'Tentativa de XSS',
        condition: (data) => data.suspiciousScript,
        action: (data) => this.handleXssAlert(data),
        enabled: true,
        cooldownMinutes: 5
      }
    ];
  }

  /**
   * Iniciar monitoramento contínuo
   */
  private startMonitoring() {
    // Monitoramento de performance a cada minuto
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000);

    // Limpeza de métricas antigas a cada hora
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);

    // Verificação de ameaças ativas a cada 5 minutos
    setInterval(() => {
      this.checkActiveThreats();
    }, 300000);
  }

  /**
   * Registrar evento de segurança
   */
  logSecurityEvent(event: Partial<SecurityEvent>) {
    const securityEvent: SecurityEvent = {
      type: event.type || 'unknown',
      severity: event.severity || 'low',
      userId: event.userId,
      ip: event.ip || 'unknown',
      userAgent: event.userAgent || 'unknown',
      timestamp: new Date(),
      details: event.details || {}
    };

    // Log do evento
    securityLogger.warn('Security Event', {
      event: securityEvent,
      alertTriggered: false
    });

    // Verificar se deve disparar alertas
    this.checkAlertRules(securityEvent);

    // Atualizar métricas
    this.updateSecurityMetrics(securityEvent);
  }

  /**
   * Verificar regras de alerta
   */
  private checkAlertRules(event: SecurityEvent) {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Verificar cooldown
      if (rule.lastTriggered) {
        const cooldownExpired = Date.now() - rule.lastTriggered.getTime() > (rule.cooldownMinutes * 60 * 1000);
        if (!cooldownExpired) continue;
      }

      // Verificar condição
      if (rule.condition(event)) {
        rule.lastTriggered = new Date();
        rule.action(event);
        
        securityLogger.error('Alert Triggered', {
          rule: rule.name,
          event,
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Atualizar métricas de segurança
   */
  private updateSecurityMetrics(event: SecurityEvent) {
    const minute = Math.floor(Date.now() / 60000);
    const key = `security_${minute}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        timestamp: new Date(),
        events: [],
        eventTypes: new Map(),
        severityCount: { low: 0, medium: 0, high: 0, critical: 0 },
        ipAddresses: new Set(),
        userIds: new Set()
      });
    }

    const metrics = this.metrics.get(key);
    metrics.events.push(event);
    
    // Contar por tipo
    const currentCount = metrics.eventTypes.get(event.type) || 0;
    metrics.eventTypes.set(event.type, currentCount + 1);
    
    // Contar por severidade
    metrics.severityCount[event.severity]++;
    
    // Adicionar IP e usuário
    metrics.ipAddresses.add(event.ip);
    if (event.userId) {
      metrics.userIds.add(event.userId);
    }
  }

  /**
   * Coletar métricas de performance
   */
  private collectPerformanceMetrics() {
    const metrics: PerformanceMetrics = {
      responseTime: 0, // Será preenchido pelo middleware
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      activeConnections: 0, // Será preenchido pelo servidor
      timestamp: new Date()
    };

    const minute = Math.floor(Date.now() / 60000);
    this.metrics.set(`performance_${minute}`, metrics);

    performanceLogger.info('Performance Metrics', metrics);

    // Verificar se performance está degradada
    if (metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      this.logSecurityEvent({
        type: 'high-memory-usage',
        severity: 'medium',
        ip: 'system',
        userAgent: 'monitor',
        details: { memoryUsage: metrics.memoryUsage }
      });
    }
  }

  /**
   * Limpar métricas antigas (mais de 24 horas)
   */
  private cleanupOldMetrics() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas atrás
    const cutoffMinute = Math.floor(cutoff / 60000);

    for (const [key] of this.metrics) {
      const keyMinute = parseInt(key.split('_')[1]);
      if (keyMinute < cutoffMinute) {
        this.metrics.delete(key);
      }
    }
  }

  /**
   * Verificar ameaças ativas
   */
  private checkActiveThreats() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const fiveMinuteKey = Math.floor(fiveMinutesAgo / 60000);

    // Verificar métricas dos últimos 5 minutos
    for (let i = 0; i < 5; i++) {
      const key = `security_${fiveMinuteKey + i}`;
      const metrics = this.metrics.get(key);
      
      if (metrics) {
        // Alta frequência de eventos críticos
        if (metrics.severityCount.critical > 3) {
          this.activeThreats.add('critical-events-spike');
        }
        
        // Muitos IPs únicos (possível ataque distribuído)
        if (metrics.ipAddresses.size > 50) {
          this.activeThreats.add('distributed-attack');
        }
      }
    }

    // Log ameaças ativas
    if (this.activeThreats.size > 0) {
      securityLogger.error('Active Threats Detected', {
        threats: Array.from(this.activeThreats),
        timestamp: new Date()
      });
    }
  }

  /**
   * Handlers para alertas específicos
   */
  private handleFailedLoginAlert(data: any) {
    securityLogger.error('Multiple Failed Login Attempts', {
      ip: data.ip,
      attempts: data.failedAttempts,
      timeWindow: '15 minutes'
    });

    // Bloquear IP temporariamente (implementar no middleware)
    this.blockIpTemporarily(data.ip, 30); // 30 minutos
  }

  private handleSuspiciousIpAlert(data: any) {
    securityLogger.error('Suspicious IP Activity', {
      ip: data.ip,
      requestCount: data.requestCount,
      timeWindow: '1 hour'
    });

    // Implementar rate limiting mais agressivo para este IP
    this.applyStrictRateLimit(data.ip);
  }

  private handleHighErrorRateAlert(data: any) {
    securityLogger.error('High Error Rate Detected', {
      errorRate: data.errorRate,
      timeWindow: '10 minutes'
    });

    // Notificar equipe de desenvolvimento
    this.notifyDevelopmentTeam('High error rate detected', data);
  }

  private handleUnusualAccessAlert(data: any) {
    securityLogger.error('Unusual Access Pattern', {
      userId: data.userId,
      resource: data.resource,
      time: data.timestamp,
      reason: 'Off-hours access to sensitive resource'
    });

    // Requerer re-autenticação
    this.requireReAuthentication(data.userId);
  }

  private handleSqlInjectionAlert(data: any) {
    securityLogger.error('SQL Injection Attempt', {
      ip: data.ip,
      query: data.query,
      endpoint: data.endpoint
    });

    // Bloquear IP imediatamente
    this.blockIpTemporarily(data.ip, 60); // 1 hora
  }

  private handleXssAlert(data: any) {
    securityLogger.error('XSS Attempt Detected', {
      ip: data.ip,
      payload: data.payload,
      endpoint: data.endpoint
    });

    // Bloquear IP imediatamente
    this.blockIpTemporarily(data.ip, 60); // 1 hora
  }

  /**
   * Métodos de ação
   */
  private blockIpTemporarily(ip: string, minutes: number) {
    // Implementar bloqueio temporário de IP
    // Isso seria integrado com o middleware de rate limiting
    auditLogger.warn('IP Temporarily Blocked', {
      ip,
      duration: `${minutes} minutes`,
      reason: 'Security alert triggered'
    });
  }

  private applyStrictRateLimit(ip: string) {
    // Implementar rate limiting mais restritivo
    auditLogger.warn('Strict Rate Limit Applied', {
      ip,
      reason: 'Suspicious activity detected'
    });
  }

  private notifyDevelopmentTeam(message: string, data: any) {
    // Implementar notificação (email, Slack, etc.)
    auditLogger.info('Development Team Notified', {
      message,
      data
    });
  }

  private requireReAuthentication(userId: string) {
    // Implementar invalidação de sessão
    auditLogger.warn('Re-authentication Required', {
      userId,
      reason: 'Unusual access pattern detected'
    });
  }

  /**
   * Obter métricas de segurança
   */
  getSecurityMetrics(timeRangeMinutes: number = 60) {
    const now = Math.floor(Date.now() / 60000);
    const metrics = {
      totalEvents: 0,
      eventsByType: new Map(),
      eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      uniqueIps: new Set(),
      uniqueUsers: new Set(),
      activeThreats: Array.from(this.activeThreats)
    };

    for (let i = 0; i < timeRangeMinutes; i++) {
      const key = `security_${now - i}`;
      const data = this.metrics.get(key);
      
      if (data) {
        metrics.totalEvents += data.events.length;
        
        // Agregar por tipo
        for (const [type, count] of data.eventTypes) {
          const currentCount = metrics.eventsByType.get(type) || 0;
          metrics.eventsByType.set(type, currentCount + count);
        }
        
        // Agregar por severidade
        for (const severity in data.severityCount) {
          metrics.eventsBySeverity[severity] += data.severityCount[severity];
        }
        
        // Agregar IPs e usuários únicos
        for (const ip of data.ipAddresses) {
          metrics.uniqueIps.add(ip);
        }
        for (const userId of data.userIds) {
          metrics.uniqueUsers.add(userId);
        }
      }
    }

    return {
      ...metrics,
      uniqueIps: metrics.uniqueIps.size,
      uniqueUsers: metrics.uniqueUsers.size,
      eventsByType: Object.fromEntries(metrics.eventsByType)
    };
  }
}

/**
 * Middleware de monitoramento de performance
 */
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log performance
    performanceLogger.info('Request Performance', {
      method: req.method,
      url: req.url,
      responseTime,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Verificar se response time está alto
    if (responseTime > 5000) { // 5 segundos
      SecurityMonitor.getInstance().logSecurityEvent({
        type: 'slow-response',
        severity: 'medium',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          method: req.method,
          url: req.url,
          responseTime,
          statusCode: res.statusCode
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware de detecção de ataques
 */
export const attackDetection = (req: Request, res: Response, next: NextFunction) => {
  const monitor = SecurityMonitor.getInstance();
  const body = req.body;
  const query = req.query;
  const params = req.params;

  // Detectar tentativas de SQL Injection
  const sqlPatterns = [
    /(\'\s*(or|and)\s*\'\s*=\s*\')/i,
    /(union\s+select)/i,
    /(drop\s+table)/i,
    /(insert\s+into)/i,
    /(delete\s+from)/i,
    /(update\s+.*\s+set)/i
  ];

  // Detectar tentativas de XSS
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i
  ];

  const allInputs = JSON.stringify({ body, query, params });

  // Verificar SQL Injection
  for (const pattern of sqlPatterns) {
    if (pattern.test(allInputs)) {
      monitor.logSecurityEvent({
        type: 'sql-injection-attempt',
        severity: 'high',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          method: req.method,
          url: req.url,
          suspiciousInput: allInputs.substring(0, 200)
        }
      });
      
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  // Verificar XSS
  for (const pattern of xssPatterns) {
    if (pattern.test(allInputs)) {
      monitor.logSecurityEvent({
        type: 'xss-attempt',
        severity: 'high',
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          method: req.method,
          url: req.url,
          suspiciousInput: allInputs.substring(0, 200)
        }
      });
      
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  next();
};

export default SecurityMonitor;
