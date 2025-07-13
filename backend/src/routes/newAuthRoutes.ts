/**
 * Rotas de Autenticação - Sistema Agropecuário
 * Controla login, registro e gerenciamento de usuários
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário (apenas administradores)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *               - cargo
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               cargo:
 *                 type: string
 *                 enum: [ADMINISTRADOR, SUPERVISOR, PEAO]
 *               telefone:
 *                 type: string
 *               cpf:
 *                 type: string
 *               endereco:
 *                 type: string
 *               salario:
 *                 type: number
 *               especialidade:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               fazendaId:
 *                 type: integer
 */
router.post('/register', [
  authenticateToken,
  requireAdmin,
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('cargo').isIn(['ADMINISTRADOR', 'SUPERVISOR', 'PEAO']).withMessage('Cargo inválido'),
  body('cpf').optional().matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const {
      nome,
      email,
      senha,
      cargo,
      telefone,
      cpf,
      endereco,
      salario,
      especialidade,
      observacoes,
      fazendaId
    } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const cpfExistente = await prisma.usuario.findUnique({
        where: { cpf }
      });

      if (cpfExistente) {
        return res.status(400).json({
          success: false,
          message: 'CPF já está em uso'
        });
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo,
        telefone,
        cpf,
        endereco,
        salario: salario ? parseFloat(salario) : null,
        especialidade,
        observacoes,
        fazendaId: fazendaId ? parseInt(fazendaId) : null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        status: true,
        telefone: true,
        cpf: true,
        endereco: true,
        salario: true,
        especialidade: true,
        observacoes: true,
        fazendaId: true,
        dataContratacao: true,
        criadoEm: true
      }
    });

    // Criar permissões padrão baseadas no cargo
    const modulosPermissoes = ['fazendas', 'funcionarios', 'cultivos', 'adubagem', 'vendas', 'estoque', 'relatorios', 'dashboard'];
    
    const permissoesData = modulosPermissoes.map(modulo => {
      let permissoes = {
        usuarioId: novoUsuario.id,
        modulo,
        ler: false,
        criar: false,
        editar: false,
        deletar: false,
        gerarRelatorio: false,
        exportarDados: false
      };

      switch (cargo) {
        case 'ADMINISTRADOR':
          permissoes = {
            ...permissoes,
            ler: true,
            criar: true,
            editar: true,
            deletar: true,
            gerarRelatorio: true,
            exportarDados: true
          };
          break;
        case 'SUPERVISOR':
          permissoes = {
            ...permissoes,
            ler: true,
            criar: true,
            editar: true,
            deletar: false,
            gerarRelatorio: true,
            exportarDados: false
          };
          break;
        case 'PEAO':
          permissoes = {
            ...permissoes,
            ler: ['cultivos', 'adubagem', 'estoque'].includes(modulo),
            criar: ['cultivos', 'adubagem'].includes(modulo),
            editar: false,
            deletar: false,
            gerarRelatorio: false,
            exportarDados: false
          };
          break;
      }

      return permissoes;
    });

    await prisma.permissao.createMany({
      data: permissoesData
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 */
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        permissoes: true,
        fazenda: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar status do usuário
    if (usuario.status !== 'ATIVO') {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    });

    // Gerar JWT
    const jwtSecret = process.env.JWT_SECRET || 'systemagro_secret_key';
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        cargo: usuario.cargo 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Preparar dados do usuário (sem senha)
    const { senha: _, ...dadosUsuario } = usuario;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        usuario: dadosUsuario,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retorna dados do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.id },
      include: {
        permissoes: true,
        fazenda: true
      }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Altera senha do usuário logado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *               novaSenha:
 *                 type: string
 */
router.put('/change-password', [
  authenticateToken,
  body('senhaAtual').notEmpty().withMessage('Senha atual é obrigatória'),
  body('novaSenha').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { senhaAtual, novaSenha } = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user!.id }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 12);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: req.user!.id },
      data: { senha: novaSenhaHash }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Lista todos os usuários (apenas administradores)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', [authenticateToken, requireAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        fazenda: true,
        permissoes: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    // Remover senhas dos resultados
    const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);

    res.json({
      success: true,
      data: usuariosSemSenha
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
