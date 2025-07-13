/**
 * Rotas para importação de dados via Excel
 * Permite importar planilhas .xlsx para atualizar dados do sistema
 */

import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { body, validationResult } from 'express-validator';

const router = Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
    }
  }
});

/**
 * @swagger
 * /api/import/excel:
 *   post:
 *     summary: Importa dados de planilha Excel
 *     tags: [Importação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo Excel (.xlsx)
 *               tipo:
 *                 type: string
 *                 enum: [fazendas, cultivos, vendas, estoque]
 *                 description: Tipo de dados a importar
 *     responses:
 *       200:
 *         description: Dados importados com sucesso
 *       400:
 *         description: Arquivo inválido ou dados incorretos
 */
router.post('/excel', upload.single('file'), [
  body('tipo').isIn(['fazendas', 'cultivos', 'vendas', 'estoque']).withMessage('Tipo de importação inválido')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo Excel é obrigatório' });
    }

    const { tipo } = req.body;
    
    // Lê o arquivo Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converte para JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'Planilha está vazia' });
    }

    // Processa dados baseado no tipo
    const resultado = processarDadosExcel(data, tipo);
    
    if (resultado.errors.length > 0) {
      return res.status(400).json({
        error: 'Erros encontrados na planilha',
        errors: resultado.errors,
        validRows: resultado.validRows,
        totalRows: data.length
      });
    }

    res.json({
      success: true,
      message: `${resultado.validRows} registros importados com sucesso`,
      data: {
        tipo,
        totalRows: data.length,
        importedRows: resultado.validRows,
        skippedRows: data.length - resultado.validRows
      }
    });
  } catch (error) {
    console.error('Erro na importação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

/**
 * Processa dados do Excel baseado no tipo de importação
 * @param data Dados extraídos do Excel
 * @param tipo Tipo de dados (fazendas, cultivos, vendas, estoque)
 * @returns Resultado do processamento
 */
function processarDadosExcel(data: any[], tipo: string) {
  const errors: string[] = [];
  let validRows = 0;

  switch (tipo) {
    case 'fazendas':
      return processarFazendas(data);
    case 'cultivos':
      return processarCultivos(data);
    case 'vendas':
      return processarVendas(data);
    case 'estoque':
      return processarEstoque(data);
    default:
      return { errors: ['Tipo de importação inválido'], validRows: 0 };
  }
}

/**
 * Processa importação de fazendas
 * Esperado: nome, proprietario, hectares, cidade, estado
 */
function processarFazendas(data: any[]) {
  const errors: string[] = [];
  let validRows = 0;

  data.forEach((row, index) => {
    const linha = index + 2; // +2 porque Excel começa em 1 e tem header
    
    if (!row.nome || !row.proprietario || !row.hectares) {
      errors.push(`Linha ${linha}: campos obrigatórios faltando (nome, proprietario, hectares)`);
      return;
    }

    if (isNaN(parseFloat(row.hectares))) {
      errors.push(`Linha ${linha}: hectares deve ser um número`);
      return;
    }

    // Aqui seria inserido no banco de dados
    console.log(`Fazenda importada: ${row.nome} - ${row.hectares}ha`);
    validRows++;
  });

  return { errors, validRows };
}

/**
 * Processa importação de cultivos
 * Esperado: fazenda, cultura, area, dataPlantio, status
 */
function processarCultivos(data: any[]) {
  const errors: string[] = [];
  let validRows = 0;
  const culturasValidas = ['Soja', 'Milho', 'Algodão', 'Cana-de-açúcar', 'Café', 'Feijão'];

  data.forEach((row, index) => {
    const linha = index + 2;
    
    if (!row.fazenda || !row.cultura || !row.area) {
      errors.push(`Linha ${linha}: campos obrigatórios faltando`);
      return;
    }

    if (!culturasValidas.includes(row.cultura)) {
      errors.push(`Linha ${linha}: cultura inválida. Use: ${culturasValidas.join(', ')}`);
      return;
    }

    if (isNaN(parseFloat(row.area))) {
      errors.push(`Linha ${linha}: área deve ser um número`);
      return;
    }

    console.log(`Cultivo importado: ${row.cultura} - ${row.area}ha`);
    validRows++;
  });

  return { errors, validRows };
}

/**
 * Processa importação de vendas
 * Esperado: fazenda, produto, quantidade, valor, data
 */
function processarVendas(data: any[]) {
  const errors: string[] = [];
  let validRows = 0;

  data.forEach((row, index) => {
    const linha = index + 2;
    
    if (!row.fazenda || !row.produto || !row.quantidade || !row.valor) {
      errors.push(`Linha ${linha}: campos obrigatórios faltando`);
      return;
    }

    if (isNaN(parseFloat(row.quantidade)) || isNaN(parseFloat(row.valor))) {
      errors.push(`Linha ${linha}: quantidade e valor devem ser números`);
      return;
    }

    console.log(`Venda importada: ${row.produto} - ${row.quantidade}kg por R$ ${row.valor}`);
    validRows++;
  });

  return { errors, validRows };
}

/**
 * Processa importação de estoque
 * Esperado: fazenda, item, categoria, quantidade, unidade
 */
function processarEstoque(data: any[]) {
  const errors: string[] = [];
  let validRows = 0;

  data.forEach((row, index) => {
    const linha = index + 2;
    
    if (!row.fazenda || !row.item || !row.categoria || !row.quantidade) {
      errors.push(`Linha ${linha}: campos obrigatórios faltando`);
      return;
    }

    if (isNaN(parseFloat(row.quantidade))) {
      errors.push(`Linha ${linha}: quantidade deve ser um número`);
      return;
    }

    console.log(`Estoque importado: ${row.item} - ${row.quantidade} ${row.unidade || 'unidades'}`);
    validRows++;
  });

  return { errors, validRows };
}

/**
 * @swagger
 * /api/import/template/{tipo}:
 *   get:
 *     summary: Baixa template Excel para importação
 *     tags: [Importação]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [fazendas, cultivos, vendas, estoque]
 *     responses:
 *       200:
 *         description: Template Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/template/:tipo', (req, res) => {
  try {
    const { tipo } = req.params;
    
    const templates = {
      fazendas: [
        { nome: 'Fazenda Exemplo', proprietario: 'João Silva', hectares: 150.5, cidade: 'Ribeirão Preto', estado: 'SP' }
      ],
      cultivos: [
        { fazenda: 'Fazenda Exemplo', cultura: 'Soja', area: 80.5, dataPlantio: '2024-10-15', status: 'plantado' }
      ],
      vendas: [
        { fazenda: 'Fazenda Exemplo', produto: 'Soja', quantidade: 5000, valor: 25000, data: '2024-12-01' }
      ],
      estoque: [
        { fazenda: 'Fazenda Exemplo', item: 'Fertilizante NPK', categoria: 'fertilizante', quantidade: 1000, unidade: 'kg' }
      ]
    };

    const templateData = templates[tipo as keyof typeof templates];
    if (!templateData) {
      return res.status(400).json({ error: 'Tipo de template inválido' });
    }

    // Cria workbook Excel
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Template');

    // Gera buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=template_${tipo}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao gerar template:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
