/**
 * Rotas para gestão de estoque
 */

import { Router } from 'express';

const router = Router();

let estoque: any[] = [
  {
    id: 1,
    fazendaId: 1,
    item: 'Ração para gado',
    categoria: 'racao',
    quantidade: 2000,
    unidade: 'kg',
    valorUnitario: 1.50
  }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: estoque });
});

router.post('/', (req, res) => {
  const novoItem = {
    id: Math.max(...estoque.map(e => e.id), 0) + 1,
    ...req.body,
    createdAt: new Date()
  };
  estoque.push(novoItem);
  res.status(201).json({ success: true, data: novoItem });
});

export default router;
