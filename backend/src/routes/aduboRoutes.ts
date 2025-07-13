/**
 * Rotas para gestão de adubos/fertilizantes
 */

import { Router } from 'express';

const router = Router();

let adubos: any[] = [
  {
    id: 1,
    fazendaId: 1,
    tipo: 'NPK 10-10-10',
    areaAplicada: 50.5,
    quantidade: 500,
    dataAplicacao: new Date('2024-10-01'),
    custoTotal: 2500
  }
];

router.get('/', (req, res) => {
  res.json({ success: true, data: adubos });
});

router.post('/', (req, res) => {
  const novoAdubo = {
    id: Math.max(...adubos.map(a => a.id), 0) + 1,
    ...req.body,
    createdAt: new Date()
  };
  adubos.push(novoAdubo);
  res.status(201).json({ success: true, data: novoAdubo });
});

export default router;
