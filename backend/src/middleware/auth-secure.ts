import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from 'express-rate-limit';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger, auditLogger, securityLogger, logUtils } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Helpers para tratar arrays JSON no SQLite
 */
const parseJsonArray = (jsonString: string | null): string[] => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

const stringifyArray = (arr: string[]): string => {
  return JSON.stringify(arr);
};

/**
 * Interface para usuário autenticado
 */
interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  mfaEnabled: boolean;
  lastLogin?: Date;
}

/**
 * Interface para payload do JWT
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  mfaVerified?: boolean;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Configurações de JWT seguras
 */
const JWT_CONFIG = {
  access: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  algorithm: 'HS256' as const,
  issuer: process.env.JWT_ISSUER || 'sistema-agropecuario',
  audience: process.env.JWT_AUDIENCE || 'sistema-agro-users',
};

/**
 * Classe para gerenciamento de autenticação segura
 */
export class AuthService {
  /**
   * Gera hash seguro da senha
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica senha
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera tokens JWT seguros
   */
  static generateTokens(user: AuthenticatedUser): { accessToken: string; refreshToken: string } {
    const payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      mfaVerified: !user.mfaEnabled, // Se MFA não está habilitado, considera verificado
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      JWT_CONFIG.access.secret,
      {
        expiresIn: JWT_CONFIG.access.expiresIn,
        algorithm: JWT_CONFIG.algorithm,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
      } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      JWT_CONFIG.refresh.secret,
      {
        expiresIn: JWT_CONFIG.refresh.expiresIn,
        algorithm: JWT_CONFIG.algorithm,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
      } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verifica e decodifica token JWT
   */
  static verifyToken(token: string, type: 'access' | 'refresh'): JWTPayload {
    const config = type === 'access' ? JWT_CONFIG.access : JWT_CONFIG.refresh;
    
    return jwt.verify(token, config.secret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as JWTPayload;
  }

  /**
   * Configura MFA para usuário
   */
  static async setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `Sistema Agropecuário (${userId})`,
      issuer: 'Sistema Agropecuário',
      length: 32,
    });

    // TODO: Implementar quando campos MFA forem adicionados ao modelo Usuario
    console.log('MFA setup initiated for user:', userId);
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    
    logUtils.logAdminAction(userId, 'MFA_SETUP_INITIATED', 'self');
    
    return {
      secret: secret.base32,
      qrCode,
    };
  }

  /**
   * Verifica código MFA
   */
  static verifyMFA(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Permite 60 segundos de diferença
    });
  }

  /**
   * Confirma configuração MFA
   */
  static async confirmMFA(userId: string, token: string): Promise<boolean> {
    // TODO: Implementar quando campos MFA forem adicionados ao modelo Usuario
    console.log('MFA confirmado para usuário:', userId, 'token:', token);
    return true;
  }
}

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrair token do header Authorization ou cookies
    let token: string | undefined;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      securityLogger.warn('Missing authentication token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
      });
      
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'MISSING_TOKEN',
      });
    }

    // Verificar token
    const decoded = AuthService.verifyToken(token, 'access');
    
    if (decoded.type !== 'access') {
      throw new Error('Tipo de token inválido');
    }

    // Buscar usuário atual no modelo Usuario
    const user = await prisma.usuario.findUnique({
      where: { id: Number(decoded.userId) },
      select: {
        id: true,
        email: true,
        nome: true,
        cargo: true,
        // Incluir relacionamento com permissões
        permissoes: {
          select: {
            modulo: true,
            ler: true,
            criar: true,
            editar: true,
            deletar: true,
            gerarRelatorio: true,
            exportarDados: true,
          }
        }
      }
    });

    if (!user) {
      securityLogger.warn('Token for deleted user', {
        userId: decoded.userId,
        ip: req.ip,
      });
      
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'INVALID_USER',
      });
    }

    // Converter permissões do Prisma para array de strings
    const permissions: string[] = [];
    user.permissoes?.forEach(perm => {
      const modulo = perm.modulo;
      if (perm.ler) permissions.push(`${modulo}:ler`);
      if (perm.criar) permissions.push(`${modulo}:criar`);
      if (perm.editar) permissions.push(`${modulo}:editar`);
      if (perm.deletar) permissions.push(`${modulo}:deletar`);
      if (perm.gerarRelatorio) permissions.push(`${modulo}:relatorio`);
      if (perm.exportarDados) permissions.push(`${modulo}:exportar`);
    });

    // Definir role baseado no cargo
    let role = 'user';
    if (user.cargo === 'ADMINISTRADOR') role = 'admin';
    else if (user.cargo === 'SUPERVISOR') role = 'supervisor';

    // Adicionar usuário à requisição
    (req as any).user = {
      id: String(user.id),
      email: user.email,
      role: role,
      permissions: permissions,
      mfaEnabled: false, // Temporariamente false até implementar MFA
      lastLogin: new Date(),
    };

    // Log de acesso bem-sucedido
    logUtils.logDataAccess(String(user.id), req.url, req.method, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    next();
  } catch (error) {
    securityLogger.error('Token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
    });

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }

    return res.status(401).json({
      error: 'Falha na autenticação',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Middleware de autorização baseada em papéis (RBAC)
 */
export const authorize = (allowedRoles: string[] = [], requiredPermissions: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED',
      });
    }

    // Verificar papel (role)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      securityLogger.warn('Insufficient role permissions', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: allowedRoles,
        url: req.url,
        method: req.method,
        ip: req.ip,
      });
      
      return res.status(403).json({
        error: 'Permissões insuficientes',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    // Verificar permissões específicas
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        securityLogger.warn('Insufficient permissions', {
          userId: user.id,
          userPermissions: user.permissions,
          requiredPermissions,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });
        
        return res.status(403).json({
          error: 'Permissões específicas insuficientes',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
      }
    }

    next();
  };
};

/**
 * Middleware de rate limiting específico para autenticação
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email,
    });
    
    res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      code: 'AUTH_RATE_LIMIT',
    });
  },
});

/**
 * Middleware de verificação MFA
 */
export const requireMFA = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED',
    });
  }

  // TODO: Implementar MFA quando campos forem adicionados ao modelo Usuario
  console.log('MFA check skipped for user:', user.id);
  next();
};

export default {
  AuthService,
  authenticateToken,
  authorize,
  authRateLimit,
  requireMFA,
};
