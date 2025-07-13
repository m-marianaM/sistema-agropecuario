/**
 * Rotas para gestão de fazendas no Sistema Agropecuário
 * CRUD completo para fazendas com validações e documentação Swagger
 * Integrado com Prisma ORM para persistência real no banco de dados
 */

import express, { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Fazenda:
 *       type: object
 *       required:
 *         - nome
 *         - proprietario
 *         - area
 *         - cidade
 *         - estado
 *         - cep
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da fazenda
 *         nome:
 *           type: string
 *           description: Nome da fazenda
 *         proprietario:
 *           type: string
 *           description: Nome do proprietário
 *         area:
 *           type: number
 *           description: Área total em hectares
 *         status:
 *           type: string
 *           enum: [ATIVA, INATIVA, MANUTENCAO]
 *           description: Status da fazenda
 *         endereco:
 *           type: string
 *           description: Endereço completo
 *         cidade:
 *           type: string
 *           description: Cidade onde está localizada
 *         estado:
 *           type: string
 *           description: Estado (UF)
 *         cep:
 *           type: string
 *           description: CEP
 *         telefone:
 *           type: string
 *           description: Telefone de contato
 *         email:
 *           type: string
 *           description: Email de contato
 *         realizaRacao:
 *           type: boolean
 *           description: Se produz ração
 *         realizaNutricao:
 *           type: boolean
 *           description: Se realiza nutrição animal
 *         dataAquisicao:
 *           type: string
 *           format: date
 *           description: Data de aquisição da fazenda
 *         valorCompra:
 *           type: number
 *           description: Valor de compra da fazenda
 *         producaoAnual:
 *           type: number
 *           description: Produção anual em toneladas
 *         custoOperacional:
 *           type: number
 *           description: Custo operacional anual
 */

/**
 * @swagger
 * /api/fazendas:
 *   get:
 *     summary: Lista todas as fazendas
 *     tags: [Fazendas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fazenda'
 *                 total:
 *                   type: integer
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Listando fazendas do banco de dados...');
    
    // Buscar todas as fazendas do banco com relacionamentos
    const fazendas = await prisma.fazenda.findMany({
      include: {
        funcionarios: true,
        cultivos: true,
        adubagens: true,
        vendas: true,
        estoques: true
      },
      orderBy: {
        criadoEm: 'desc'
      }
    });

    console.log(`✅ ${fazendas.length} fazendas encontradas no banco`);

    res.json({
      success: true,
      data: fazendas,
      total: fazendas.length,
      message: `${fazendas.length} fazendas encontradas`
    });
  } catch (error) {
    console.error('❌ Erro ao listar fazendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar fazendas no banco de dados'
    });
  }
});

/**
 * @swagger
 * /api/fazendas/{id}:
 *   get:
 *     summary: Busca uma fazenda por ID
 *     tags: [Fazendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fazenda encontrada
 *       404:
 *         description: Fazenda não encontrada
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id);
    console.log(`🔍 Buscando fazenda ID ${id}...`);

    const fazenda = await prisma.fazenda.findUnique({
      where: { id },
      include: {
        funcionarios: true,
        cultivos: true,
        adubagens: true,
        vendas: true,
        estoques: true
      }
    });

    if (!fazenda) {
      return res.status(404).json({
        success: false,
        error: 'Fazenda não encontrada',
        message: `Fazenda com ID ${id} não existe`
      });
    }

    console.log(`✅ Fazenda "${fazenda.nome}" encontrada`);

    res.json({
      success: true,
      data: fazenda
    });
  } catch (error) {
    console.error('❌ Erro ao buscar fazenda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/fazendas:
 *   post:
 *     summary: Cria uma nova fazenda
 *     tags: [Fazendas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fazenda'
 *     responses:
 *       201:
 *         description: Fazenda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', [
  body('nome').notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('proprietario').notEmpty().withMessage('Proprietário é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Proprietário deve ter entre 2 e 100 caracteres'),
  body('area').isFloat({ min: 0.1 }).withMessage('Área deve ser um número positivo'),
  body('cidade').notEmpty().withMessage('Cidade é obrigatória'),
  body('estado').notEmpty().withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('cep').notEmpty().withMessage('CEP é obrigatório')
    .matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato XXXXX-XXX'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('realizaRacao').optional().isBoolean().withMessage('realizaRacao deve ser true ou false'),
  body('realizaNutricao').optional().isBoolean().withMessage('realizaNutricao deve ser true ou false'),
  body('valorCompra').optional().isFloat({ min: 0 }).withMessage('Valor de compra deve ser positivo'),
  body('producaoAnual').optional().isFloat({ min: 0 }).withMessage('Produção anual deve ser positiva'),
  body('custoOperacional').optional().isFloat({ min: 0 }).withMessage('Custo operacional deve ser positivo')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      nome,
      proprietario,
      area,
      endereco,
      cidade,
      estado,
      cep,
      telefone,
      email,
      realizaRacao = false,
      realizaNutricao = false,
      dataAquisicao,
      valorCompra,
      producaoAnual,
      custoOperacional
    } = req.body;

    console.log(`➕ Criando nova fazenda: ${nome}`);

    // Verificar se já existe fazenda com o mesmo nome
    const fazendaExistente = await prisma.fazenda.findFirst({
      where: {
        nome: nome
      }
    });

    if (fazendaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Fazenda já existe',
        message: `Já existe uma fazenda com o nome "${nome}"`
      });
    }

    // Criar nova fazenda no banco
    const novaFazenda = await prisma.fazenda.create({
      data: {
        nome,
        proprietario,
        area,
        endereco: endereco || '',
        cidade,
        estado,
        cep,
        telefone,
        email,
        realizaRacao,
        realizaNutricao,
        dataAquisicao: dataAquisicao ? new Date(dataAquisicao) : null,
        valorCompra,
        producaoAnual,
        custoOperacional,
        status: 'ATIVA'
      },
      include: {
        funcionarios: true,
        cultivos: true,
        adubagens: true,
        vendas: true,
        estoques: true
      }
    });

    console.log(`✅ Fazenda "${novaFazenda.nome}" criada com ID ${novaFazenda.id}`);

    res.status(201).json({
      success: true,
      data: novaFazenda,
      message: 'Fazenda criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar fazenda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao salvar fazenda no banco de dados'
    });
  }
});

/**
 * @swagger
 * /api/fazendas/{id}:
 *   put:
 *     summary: Atualiza uma fazenda
 *     tags: [Fazendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fazenda'
 *     responses:
 *       200:
 *         description: Fazenda atualizada com sucesso
 *       404:
 *         description: Fazenda não encontrada
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  body('nome').optional().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('proprietario').optional().isLength({ min: 2, max: 100 }).withMessage('Proprietário deve ter entre 2 e 100 caracteres'),
  body('area').optional().isFloat({ min: 0.1 }).withMessage('Área deve ser um número positivo'),
  body('cidade').optional().notEmpty().withMessage('Cidade não pode estar vazia'),
  body('estado').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('cep').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP deve estar no formato XXXXX-XXX'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('status').optional().isIn(['ATIVA', 'INATIVA', 'MANUTENCAO']).withMessage('Status inválido')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id);
    console.log(`✏️ Atualizando fazenda ID ${id}...`);

    // Verificar se fazenda existe
    const fazendaExistente = await prisma.fazenda.findUnique({
      where: { id }
    });

    if (!fazendaExistente) {
      return res.status(404).json({
        success: false,
        error: 'Fazenda não encontrada',
        message: `Fazenda com ID ${id} não existe`
      });
    }

    // Atualizar fazenda
    const fazendaAtualizada = await prisma.fazenda.update({
      where: { id },
      data: {
        ...req.body,
        dataAquisicao: req.body.dataAquisicao ? new Date(req.body.dataAquisicao) : undefined
      },
      include: {
        funcionarios: true,
        cultivos: true,
        adubagens: true,
        vendas: true,
        estoques: true
      }
    });

    console.log(`✅ Fazenda "${fazendaAtualizada.nome}" atualizada`);

    res.json({
      success: true,
      data: fazendaAtualizada,
      message: 'Fazenda atualizada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar fazenda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/fazendas/{id}:
 *   delete:
 *     summary: Remove uma fazenda
 *     tags: [Fazendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fazenda removida com sucesso
 *       404:
 *         description: Fazenda não encontrada
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id);
    console.log(`🗑️ Removendo fazenda ID ${id}...`);

    // Verificar se fazenda existe
    const fazendaExistente = await prisma.fazenda.findUnique({
      where: { id },
      include: {
        funcionarios: true,
        cultivos: true,
        adubagens: true,
        vendas: true,
        estoques: true
      }
    });

    if (!fazendaExistente) {
      return res.status(404).json({
        success: false,
        error: 'Fazenda não encontrada',
        message: `Fazenda com ID ${id} não existe`
      });
    }

    // Verificar se há dependências (funcionários, cultivos, etc.)
    const temDependencias = 
      fazendaExistente.funcionarios.length > 0 ||
      fazendaExistente.cultivos.length > 0 ||
      fazendaExistente.adubagens.length > 0 ||
      fazendaExistente.vendas.length > 0 ||
      fazendaExistente.estoques.length > 0;

    if (temDependencias) {
      return res.status(400).json({
        success: false,
        error: 'Fazenda possui dependências',
        message: 'Não é possível remover fazenda que possui funcionários, cultivos, vendas ou outros dados relacionados'
      });
    }

    // Remover fazenda
    await prisma.fazenda.delete({
      where: { id }
    });

    console.log(`✅ Fazenda "${fazendaExistente.nome}" removida`);

    res.json({
      success: true,
      message: 'Fazenda removida com sucesso',
      data: fazendaExistente
    });
  } catch (error) {
    console.error('❌ Erro ao remover fazenda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
