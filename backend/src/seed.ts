/**
 * Script de inicialização do banco de dados
 * Cria usuário administrador inicial e dados de exemplo
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Lista de módulos do sistema
    const modulos = ['fazendas', 'funcionarios', 'cultivos', 'adubagem', 'vendas', 'estoque', 'relatorios', 'dashboard'];

    // Verificar se já existe um administrador
    const adminExistente = await prisma.usuario.findFirst({
      where: { cargo: 'ADMINISTRADOR' }
    });

    if (adminExistente) {
      console.log('✅ Administrador já existe, pulando criação...');
    } else {
      // Criar usuário administrador inicial
      const senhaHash = await bcrypt.hash('admin123', 12);
      
      const admin = await prisma.usuario.create({
        data: {
          nome: 'Administrador Sistema',
          email: 'admin@systemagro.com',
          senha: senhaHash,
          cargo: 'ADMINISTRADOR',
          telefone: '(11) 99999-9999',
          cpf: '12345678901',
          endereco: 'Rua do Sistema, 123',
          salario: 5000.00,
          observacoes: 'Usuário administrador inicial do sistema'
        }
      });

      // Criar permissões para o administrador
      const permissoesAdmin = modulos.map(modulo => ({
        usuarioId: admin.id,
        modulo,
        ler: true,
        criar: true,
        editar: true,
        deletar: true,
        gerarRelatorio: true,
        exportarDados: true
      }));

      await prisma.permissao.createMany({
        data: permissoesAdmin
      });

      console.log('✅ Administrador criado com sucesso!');
      console.log('📧 Email: admin@systemagro.com');
      console.log('🔑 Senha: admin123');
    }

    // Criar fazenda de exemplo
    const fazendaExistente = await prisma.fazenda.findFirst();
    
    if (!fazendaExistente) {
      const fazendaExemplo = await prisma.fazenda.create({
        data: {
          nome: 'Fazenda São João',
          proprietario: 'João Silva Santos',
          area: 150.5,
          cidade: 'Goiânia',
          estado: 'GO',
          cep: '74000-000',
          telefone: '(62) 99999-8888',
          email: 'joao@fazendas.com',
          realizaRacao: true,
          realizaNutricao: true,
          dataAquisicao: new Date('2020-01-15'),
          valorCompra: 800000.00,
          producaoAnual: 2500.00,
          custoOperacional: 120000.00
        }
      });

      console.log('✅ Fazenda de exemplo criada:', fazendaExemplo.nome);

      // Criar supervisor de exemplo
      const senhaSupervisor = await bcrypt.hash('super123', 12);
      
      const supervisor = await prisma.usuario.create({
        data: {
          nome: 'Carlos Oliveira',
          email: 'supervisor@systemagro.com',
          senha: senhaSupervisor,
          cargo: 'SUPERVISOR',
          telefone: '(62) 98888-7777',
          cpf: '98765432100',
          endereco: 'Rua dos Supervisores, 456',
          salario: 3500.00,
          especialidade: 'Gestão de Cultivos',
          fazendaId: fazendaExemplo.id
        }
      });

      // Criar permissões para supervisor
      const permissoesSupervisor = modulos.map(modulo => ({
        usuarioId: supervisor.id,
        modulo,
        ler: true,
        criar: true,
        editar: true,
        deletar: false,
        gerarRelatorio: true,
        exportarDados: false
      }));

      await prisma.permissao.createMany({
        data: permissoesSupervisor
      });

      console.log('✅ Supervisor criado:', supervisor.nome);

      // Criar peão de exemplo
      const senhaPeao = await bcrypt.hash('peao123', 12);
      
      const peao = await prisma.usuario.create({
        data: {
          nome: 'Maria Fernandes',
          email: 'peao@systemagro.com',
          senha: senhaPeao,
          cargo: 'PEAO',
          telefone: '(62) 97777-6666',
          cpf: '55566677788',
          endereco: 'Rua dos Trabalhadores, 789',
          salario: 2000.00,
          especialidade: 'Operações de Campo',
          fazendaId: fazendaExemplo.id
        }
      });

      // Criar permissões limitadas para peão
      const permissoesPeao = modulos.map(modulo => ({
        usuarioId: peao.id,
        modulo,
        ler: ['cultivos', 'adubagem', 'estoque'].includes(modulo),
        criar: ['cultivos', 'adubagem'].includes(modulo),
        editar: false,
        deletar: false,
        gerarRelatorio: false,
        exportarDados: false
      }));

      await prisma.permissao.createMany({
        data: permissoesPeao
      });

      console.log('✅ Peão criado:', peao.nome);
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📋 Usuários criados:');
    console.log('1. Admin: admin@systemagro.com / admin123');
    console.log('2. Supervisor: supervisor@systemagro.com / super123');
    console.log('3. Peão: peao@systemagro.com / peao123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
