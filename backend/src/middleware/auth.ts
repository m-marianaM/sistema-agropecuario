import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    cargo: string;
    fazendaId?: number;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'systemagro_secret_key') as any;
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        cargo: true,
        status: true,
        fazendaId: true
      }
    });

    if (!usuario || usuario.status !== 'ATIVO') {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário inativo ou não encontrado' 
      });
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      cargo: usuario.cargo,
      fazendaId: usuario.fazendaId || undefined
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// Middleware para verificar permissões específicas
export const requirePermission = (modulo: string, acao: 'ler' | 'criar' | 'editar' | 'deletar' | 'gerarRelatorio' | 'exportarDados') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
      }

      // Administrador tem acesso total
      if (req.user.cargo === 'ADMINISTRADOR') {
        return next();
      }

      // Verificar permissão específica
      const permissao = await prisma.permissao.findUnique({
        where: {
          usuarioId_modulo: {
            usuarioId: req.user.id,
            modulo: modulo
          }
        }
      });

      if (!permissao || !permissao[acao]) {
        return res.status(403).json({ 
          success: false, 
          message: `Acesso negado. Permissão necessária: ${acao} em ${modulo}` 
        });
      }

      next();
    } catch (error) {
      console.error('Erro na verificação de permissão:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  };
};

// Middleware para verificar se é administrador
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.cargo !== 'ADMINISTRADOR') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso restrito a administradores' 
    });
  }
  next();
};

// Middleware para verificar se é administrador ou supervisor
export const requireAdminOrSupervisor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['ADMINISTRADOR', 'SUPERVISOR'].includes(req.user.cargo)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso restrito a administradores e supervisores' 
    });
  }
  next();
};
