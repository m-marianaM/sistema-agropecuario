/**
 * Configuração do Prisma Client para Sistema Agropecuário
 * Instância única do cliente do banco de dados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db?charset=UTF8&collation=utf8_unicode_ci'
    }
  }
});

export default prisma;
