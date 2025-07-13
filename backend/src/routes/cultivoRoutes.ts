/**
 * Rotas para gestão de cultivos no Sistema Agropecuário
 * Controla plantio, colheita e produção por fazenda
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// Simulação de banco de dados de cultivos
let cultivos: any[] = [
  {
    id: 1,
    fazendaId: 1,
    tipoCultura: 'Soja',
    variedade: 'SoyMax 3000',
    areaHectares: 80.5,
    dataPlantio: '2024-10-15',
    dataColheitaPrevista: '2025-02-15',
    status: 'plantado',
    producaoEstimadaTon: 240.0,
    producaoRealTon: null,
    fertilizanteTipo: 'NPK 10-10-10',
    fertilizanteQuantidade: 300,
    irrigacao: 'aspersao',
    observacoes: 'Primeira safra da temporada',
    criadoEm: '2024-10-15T10:00:00Z',
    atualizadoEm: '2024-10-15T10:00:00Z'
  },
  {
    id: 2,
    fazendaId: 1,
    tipoCultura: 'Milho',
    variedade: 'Pioneer 3844',
    areaHectares: 45.2,
    dataPlantio: '2024-09-10',
    dataColheitaPrevista: '2025-01-20',
    status: 'crescimento',
    producaoEstimadaTon: 180.0,
    producaoRealTon: null,
    fertilizanteTipo: 'Ureia',
    fertilizanteQuantidade: 250,
    irrigacao: 'gotejamento',
    observacoes: 'Desenvolvimento normal',
    criadoEm: '2024-09-10T08:30:00Z',
    atualizadoEm: '2024-11-01T14:20:00Z'
  },
  {
    id: 3,
    fazendaId: 2,
    tipoCultura: 'Soja',
    variedade: 'Monsoy 8644',
    areaHectares: 120.0,
    dataPlantio: '2024-09-01',
    dataColheitaPrevista: '2025-01-30',
    status: 'colhido',
    producaoEstimadaTon: 480.0,
    producaoRealTon: 464.0,
    fertilizanteTipo: 'MAP',
    fertilizanteQuantidade: 400,
    irrigacao: 'sequeiro',
    observacoes: 'Boa produtividade mesmo com pouca chuva',
    criadoEm: '2024-09-01T07:00:00Z',
    atualizadoEm: '2025-01-30T16:45:00Z'
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Cultivo:
 *       type: object
 *       required:
 *         - fazendaId
 *         - cultura
 *         - areaPlantada
 *         - dataPlantio
 *       properties:
 *         id:
 *           type: integer
 *         fazendaId:
 *           type: integer
 *         cultura:
 *           type: string
 *           enum: [Soja, Milho, Algodão, Cana-de-açúcar, Café, Feijão]
 *         areaPlantada:
 *           type: number
 *         dataPlantio:
 *           type: string
 *           format: date
 *         previsaoColheita:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [plantado, crescimento, colhido, perdido]
 *         producaoEstimada:
 *           type: number
 *         producaoReal:
 *           type: number
 */

/**
 * @swagger
 * /api/cultivos:
 *   get:
 *     summary: Lista todos os cultivos
 *     tags: [Cultivos]
 *     parameters:
 *       - in: query
 *         name: fazendaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cultura
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de cultivos
 */
router.get('/', (req, res) => {
  try {
    const { fazendaId, cultura, status } = req.query;
    let cultivosFiltrados = [...cultivos];

    if (fazendaId) {
      cultivosFiltrados = cultivosFiltrados.filter(c => 
        c.fazendaId === parseInt(fazendaId as string)
      );
    }

    if (cultura) {
      cultivosFiltrados = cultivosFiltrados.filter(c => 
        c.cultura.toLowerCase().includes((cultura as string).toLowerCase())
      );
    }

    if (status) {
      cultivosFiltrados = cultivosFiltrados.filter(c => 
        c.status === status
      );
    }

    res.json({
      success: true,
      data: cultivosFiltrados,
      total: cultivosFiltrados.length
    });
  } catch (error) {
    console.error('Erro ao listar cultivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/cultivos:
 *   post:
 *     summary: Registra um novo cultivo/plantio
 *     tags: [Cultivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cultivo'
 *     responses:
 *       201:
 *         description: Cultivo registrado com sucesso
 */
router.post('/', [
  body('fazendaId').isInt({ min: 1 }).withMessage('ID da fazenda é obrigatório'),
  body('tipoCultura').isIn(['Milho', 'Soja']).withMessage('Tipo de cultura deve ser Milho ou Soja'),
  body('variedade').isLength({ min: 2 }).withMessage('Variedade é obrigatória'),
  body('areaHectares').isFloat({ min: 0.1 }).withMessage('Área em hectares deve ser positiva'),
  body('dataPlantio').isISO8601().withMessage('Data de plantio inválida'),
  body('dataColheitaPrevista').optional().isISO8601().withMessage('Data de colheita prevista inválida'),
  body('producaoEstimadaTon').optional().isFloat({ min: 0 }).withMessage('Produção estimada deve ser positiva'),
  body('fertilizanteTipo').optional().isLength({ min: 2 }).withMessage('Tipo de fertilizante inválido'),
  body('fertilizanteQuantidade').optional().isFloat({ min: 0 }).withMessage('Quantidade de fertilizante deve ser positiva'),
  body('irrigacao').optional().isIn(['sequeiro', 'aspersao', 'gotejamento', 'pivotcentral']).withMessage('Tipo de irrigação inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const novoCultivo = {
      id: Math.max(...cultivos.map(c => c.id), 0) + 1,
      ...req.body,
      status: 'plantado',
      producaoRealTon: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    cultivos.push(novoCultivo);

    res.status(201).json({
      success: true,
      message: 'Cultivo registrado com sucesso',
      data: novoCultivo
    });
  } catch (error) {
    console.error('Erro ao registrar cultivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/cultivos/{id}/colheita:
 *   patch:
 *     summary: Registra a colheita de um cultivo
 *     tags: [Cultivos]
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
 *             type: object
 *             properties:
 *               producaoReal:
 *                 type: number
 *               dataColheita:
 *                 type: string
 *                 format: date
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Colheita registrada com sucesso
 */
router.patch('/:id/colheita', [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('producaoReal').isFloat({ min: 0 }).withMessage('Produção real deve ser positiva'),
  body('dataColheita').optional().isISO8601().withMessage('Data de colheita inválida')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const cultivoIndex = cultivos.findIndex(c => c.id === id);

    if (cultivoIndex === -1) {
      return res.status(404).json({ error: 'Cultivo não encontrado' });
    }

    cultivos[cultivoIndex] = {
      ...cultivos[cultivoIndex],
      producaoReal: req.body.producaoReal,
      dataColheita: req.body.dataColheita || new Date(),
      status: 'colhido',
      observacoes: req.body.observacoes || cultivos[cultivoIndex].observacoes,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Colheita registrada com sucesso',
      data: cultivos[cultivoIndex]
    });
  } catch (error) {
    console.error('Erro ao registrar colheita:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/cultivos/{id}:
 *   put:
 *     summary: Atualiza um cultivo existente
 *     tags: [Cultivos]
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
 *             $ref: '#/components/schemas/Cultivo'
 *     responses:
 *       200:
 *         description: Cultivo atualizado com sucesso
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('fazendaId').isInt({ min: 1 }).withMessage('ID da fazenda é obrigatório'),
  body('tipoCultura').isIn(['Milho', 'Soja']).withMessage('Tipo de cultura deve ser Milho ou Soja'),
  body('variedade').isLength({ min: 2 }).withMessage('Variedade é obrigatória'),
  body('areaHectares').isFloat({ min: 0.1 }).withMessage('Área em hectares deve ser positiva'),
  body('dataPlantio').isISO8601().withMessage('Data de plantio inválida'),
  body('dataColheitaPrevista').optional().isISO8601().withMessage('Data de colheita prevista inválida'),
  body('status').isIn(['plantado', 'crescimento', 'colhido', 'perdido']).withMessage('Status inválido'),
  body('producaoEstimadaTon').optional().isFloat({ min: 0 }).withMessage('Produção estimada deve ser positiva'),
  body('fertilizanteTipo').optional().isLength({ min: 2 }).withMessage('Tipo de fertilizante inválido'),
  body('fertilizanteQuantidade').optional().isFloat({ min: 0 }).withMessage('Quantidade de fertilizante deve ser positiva'),
  body('irrigacao').optional().isIn(['sequeiro', 'aspersao', 'gotejamento', 'pivotcentral']).withMessage('Tipo de irrigação inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cultivoId = parseInt(req.params.id);
    const cultivoIndex = cultivos.findIndex(c => c.id === cultivoId);

    if (cultivoIndex === -1) {
      return res.status(404).json({ error: 'Cultivo não encontrado' });
    }

    const cultivoAtualizado = {
      ...cultivos[cultivoIndex],
      ...req.body,
      id: cultivoId,
      atualizadoEm: new Date().toISOString()
    };

    cultivos[cultivoIndex] = cultivoAtualizado;

    res.json({
      success: true,
      message: 'Cultivo atualizado com sucesso',
      data: cultivoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar cultivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/cultivos/{id}:
 *   delete:
 *     summary: Remove um cultivo
 *     tags: [Cultivos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cultivo removido com sucesso
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cultivoId = parseInt(req.params.id);
    const cultivoIndex = cultivos.findIndex(c => c.id === cultivoId);

    if (cultivoIndex === -1) {
      return res.status(404).json({ error: 'Cultivo não encontrado' });
    }

    const cultivoRemovido = cultivos[cultivoIndex];
    cultivos.splice(cultivoIndex, 1);

    res.json({
      success: true,
      message: 'Cultivo removido com sucesso',
      data: cultivoRemovido
    });
  } catch (error) {
    console.error('Erro ao remover cultivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/cultivos/{id}/status:
 *   patch:
 *     summary: Atualiza apenas o status de um cultivo
 *     tags: [Cultivos]
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
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [plantado, crescimento, colhido, perdido]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/:id/status', [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('status').isIn(['plantado', 'crescimento', 'colhido', 'perdido']).withMessage('Status inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const cultivoId = parseInt(req.params.id);
    const cultivoIndex = cultivos.findIndex(c => c.id === cultivoId);

    if (cultivoIndex === -1) {
      return res.status(404).json({ error: 'Cultivo não encontrado' });
    }

    cultivos[cultivoIndex].status = req.body.status;
    cultivos[cultivoIndex].atualizadoEm = new Date().toISOString();

    res.json({
      success: true,
      message: 'Status do cultivo atualizado com sucesso',
      data: cultivos[cultivoIndex]
    });
  } catch (error) {
    console.error('Erro ao atualizar status do cultivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
