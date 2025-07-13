/**
 * Rotas para gestão de vendas
 */

import { Router } from 'express';

const router = Router();

let vendas: any[] = [
  {
    id: 1,
    fazendaId: 1,
    produto: 'Soja',
    quantidade: 5000,
    valorTotal: 25000,
    comprador: 'Cooperativa ABC',
    dataVenda: new Date('2024-12-01')
  }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: vendas });
});

router.post('/', (req, res) => {
  const novaVenda = {
    id: Math.max(...vendas.map(v => v.id), 0) + 1,
    ...req.body,
    createdAt: new Date()
  };
  vendas.push(novaVenda);
  res.status(201).json({ success: true, data: novaVenda });
});

export default router;
