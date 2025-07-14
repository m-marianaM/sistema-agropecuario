/**
 * Context para gerenciar o estado das fazendas em toda a aplicação
 * Compartilha dados entre Dashboard e página de Fazendas
 * Integração com API para persistência de dados
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fazendasAPI, 
  funcionariosAPI, 
  verificarConectividade, 
  FazendaAPI, 
  FuncionarioAPI,
  buscarCultivos,
  criarCultivo,
  atualizarCultivo,
  atualizarStatusCultivo,
  removerCultivo as removerCultivoAPI,
  CultivoAPI
} from '../utils/api';

// Tipos TypeScript
interface Permissao {
  modulo: string;
  ler: boolean;
  criar: boolean;
  editar: boolean;
  deletar: boolean;
  gerarRelatorio: boolean;
  exportarDados: boolean;
}

// Interface para Adubações
interface Adubacao {
  tipoAdubo: string;
  quantidadeKgHa: number;
  dataAplicacao: string;
}

// Interface para Defensivos
interface Defensivo {
  produto: string;
  tipo: 'Inseticida' | 'Fungicida' | 'Herbicida';
  dose: string;
  data: string;
  aplicador?: string;
}

// Interface para Cultivos (seguindo especificação completa)
interface Cultivo {
  id: number;
  fazendaId: number;
  nomeFazenda?: string;
  talhao?: string;
  responsavelTecnico?: string;
  cultura: 'Milho' | 'Soja';
  tipoCultivo: 'Milho Verão' | 'Milho Safrinha' | 'Soja Precoce' | 'Soja Tardia';
  areaHectares: number;
  dataPlantio: string;
  dataColheitaPrevista: string;
  dataColheitaReal?: string;
  adubacoes: Adubacao[];
  defensivos: Defensivo[];
  tipoSolo?: string;
  precipitacaoMm?: number;
  produtividadeEsperada: number;
  produtividadeReal?: number;
  status: 'Plantado' | 'Crescimento' | 'Floração' | 'Maturação' | 'Colhido';
  observacoes?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  
  // Campos de compatibilidade com sistema atual
  tipoCultura?: 'Milho' | 'Soja'; // Para compatibilidade
  variedade?: string;
  producaoEstimadaTon?: number;
  fertilizanteTipo?: string;
  fertilizanteQuantidade?: number;
  irrigacao?: 'sequeiro' | 'aspersao' | 'gotejamento' | 'pivotcentral';
  
  // Novos campos detalhados para gestão agrícola completa
  espacamentoLinhas?: number; // cm
  densidadePlantio?: number; // plantas/ha
  profundidadePlantio?: number; // cm
  sistemaIrrigacao?: 'Sequeiro' | 'Aspersão' | 'Gotejamento' | 'Pivô Central';
  preparoSolo?: 'Convencional' | 'Plantio Direto' | 'Cultivo Mínimo';
  custoProducao?: number;
  custoSementes?: number;
  custoFertilizantes?: number;
  custoDefensivos?: number;
  custoMaoObra?: number;
  precoVendaEstimado?: number; // R$/saca
  certificacaoOrganica?: boolean;
  analiseSolo?: boolean;
  seguroAgricola?: boolean;
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: 'administrador' | 'supervisor' | 'peao';
  dataContratacao: string;
  salario: number;
  status: 'ativo' | 'inativo';
  telefone: string;
  fazendaId: number;
  cpf?: string;
  endereco?: string;
  especialidade?: string;
  observacoes?: string;
  permissoes: Permissao[];
}

interface Fazenda {
  id: number;
  nome: string;
  area: number;
  status: 'ativa' | 'inativa' | 'manutencao';
  cultivos: string[];
  endereco: { cidade: string; estado: string; cep: string; rua?: string };
  proprietario: string;
  dataAquisicao: string;
  valorCompra: number;
  producaoAnual: number;
  custoOperacional: number;
  funcionarios: Funcionario[];
  telefone?: string;
  email?: string;
  realizaRacao?: boolean;
  realizaNutricao?: boolean;
}

interface FazendasContextData {
  fazendas: Fazenda[];
  cultivos: Cultivo[];
  loading: boolean;
  erro: string | null;
  setFazendas: React.Dispatch<React.SetStateAction<Fazenda[]>>;
  setCultivos: React.Dispatch<React.SetStateAction<Cultivo[]>>;
  // Fazendas
  adicionarFazenda: (fazenda: Fazenda) => Promise<void>;
  editarFazenda: (id: number, fazenda: Partial<Fazenda>) => Promise<void>;
  removerFazenda: (id: number) => Promise<void>;
  alterarStatusFazenda: (id: number, novoStatus: 'ativa' | 'inativa' | 'manutencao') => Promise<void>;
  // Funcionários
  adicionarFuncionario: (fazendaId: number, funcionario: Funcionario) => Promise<void>;
  editarFuncionario: (fazendaId: number, funcionarioId: number, funcionario: Funcionario) => Promise<void>;
  removerFuncionario: (fazendaId: number, funcionarioId: number) => Promise<void>;
  // Cultivos
  adicionarCultivo: (cultivo: Cultivo) => Promise<void>;
  editarCultivo: (id: number, cultivo: Partial<Cultivo>) => Promise<void>;
  removerCultivo: (id: number) => Promise<void>;
  alterarStatusCultivo: (id: number, novoStatus: 'plantado' | 'crescimento' | 'colhido' | 'perdido') => Promise<void>;
  // Utilitários
  recarregarFazendas: () => Promise<void>;
  recarregarCultivos: () => Promise<void>;
}

// Função para gerar permissões padrão
const getPermissoesPadrao = (cargo: 'administrador' | 'supervisor' | 'peao'): Permissao[] => {
  const modulos = ['fazendas', 'funcionarios', 'cultivos', 'adubagem', 'vendas', 'estoque', 'relatorios', 'dashboard'];
  
  return modulos.map(modulo => {
    switch (cargo) {
      case 'administrador':
        return { 
          modulo, 
          ler: true, 
          criar: true, 
          editar: true, 
          deletar: true, 
          gerarRelatorio: true, 
          exportarDados: true 
        };
      case 'supervisor':
        return { 
          modulo, 
          ler: true, 
          criar: true, 
          editar: true, 
          deletar: false, 
          gerarRelatorio: true, 
          exportarDados: false 
        };
      case 'peao':
        return { 
          modulo, 
          ler: true, 
          criar: false, 
          editar: false, 
          deletar: false, 
          gerarRelatorio: false, 
          exportarDados: false 
        };
      default:
        return { 
          modulo, 
          ler: false, 
          criar: false, 
          editar: false, 
          deletar: false, 
          gerarRelatorio: false, 
          exportarDados: false 
        };
    }
  });
};

// Dados iniciais das fazendas
const fazendasIniciais: Fazenda[] = [
  {
    id: 1,
    nome: 'Fazenda Central',
    area: 450,
    status: 'ativa',
    cultivos: ['Milho', 'Soja'],
    endereco: { cidade: 'Goiânia', estado: 'GO', cep: '74000-000' },
    proprietario: 'João Silva',
    dataAquisicao: '2020-03-15',
    valorCompra: 2500000,
    producaoAnual: 1200,
    custoOperacional: 180000,
    telefone: '(62) 99999-1001',
    email: 'joao@fazendacentral.com',
    realizaRacao: true,
    realizaNutricao: false,
    funcionarios: [
      {
        id: 1,
        nome: 'Carlos Santos',
        email: 'carlos@fazenda.com',
        cargo: 'administrador',
        dataContratacao: '2020-04-01',
        salario: 8500,
        status: 'ativo',
        telefone: '(62) 99999-0001',
        fazendaId: 1,
        cpf: '123.456.789-01',
        endereco: 'Rua das Flores, 123 - Goiânia/GO',
        permissoes: getPermissoesPadrao('administrador')
      },
      {
        id: 2,
        nome: 'Maria Oliveira',
        email: 'maria@fazenda.com',
        cargo: 'supervisor',
        dataContratacao: '2021-02-10',
        salario: 5500,
        status: 'ativo',
        telefone: '(62) 99999-0002',
        fazendaId: 1,
        cpf: '234.567.890-12',
        endereco: 'Av. Principal, 456 - Goiânia/GO',
        permissoes: getPermissoesPadrao('supervisor')
      },
      {
        id: 3,
        nome: 'José Pereira',
        email: 'jose@fazenda.com',
        cargo: 'peao',
        dataContratacao: '2021-08-15',
        salario: 2800,
        status: 'ativo',
        telefone: '(62) 99999-0003',
        fazendaId: 1,
        cpf: '345.678.901-23',
        endereco: 'Rua do Campo, 789 - Goiânia/GO',
        permissoes: getPermissoesPadrao('peao')
      }
    ]
  },
  {
    id: 2,
    nome: 'Sítio Esperança',
    area: 280,
    status: 'ativa',
    cultivos: ['Milho'],
    endereco: { cidade: 'Anápolis', estado: 'GO', cep: '75000-000' },
    proprietario: 'Ana Costa',
    dataAquisicao: '2019-11-20',
    valorCompra: 1800000,
    producaoAnual: 850,
    custoOperacional: 125000,
    telefone: '(62) 99999-2002',
    email: 'ana@sitioesperanca.com',
    realizaRacao: false,
    realizaNutricao: true,
    funcionarios: [
      {
        id: 4,
        nome: 'Roberto Lima',
        email: 'roberto@sitio.com',
        cargo: 'administrador',
        dataContratacao: '2020-01-05',
        salario: 7500,
        status: 'ativo',
        telefone: '(62) 99999-0004',
        fazendaId: 2,
        cpf: '456.789.012-34',
        endereco: 'Fazenda Esperança, Zona Rural - Anápolis/GO',
        permissoes: getPermissoesPadrao('administrador')
      },
      {
        id: 5,
        nome: 'Pedro Alves',
        email: 'pedro@sitio.com',
        cargo: 'peao',
        dataContratacao: '2021-05-12',
        salario: 2600,
        status: 'ativo',
        telefone: '(62) 99999-0005',
        fazendaId: 2,
        cpf: '567.890.123-45',
        endereco: 'Vila Rural, 321 - Anápolis/GO',
        permissoes: getPermissoesPadrao('peao')
      }
    ]
  },
  {
    id: 3,
    nome: 'Fazenda Norte',
    area: 620,
    status: 'ativa',
    cultivos: ['Soja'],
    endereco: { cidade: 'Rio Verde', estado: 'GO', cep: '75900-000' },
    proprietario: 'Francisco Rocha',
    dataAquisicao: '2018-07-10',
    valorCompra: 3200000,
    producaoAnual: 1850,
    custoOperacional: 245000,
    telefone: '(62) 99999-3003',
    email: 'francisco@fazendanorte.com',
    realizaRacao: true,
    realizaNutricao: true,
    funcionarios: [
      {
        id: 6,
        nome: 'Antonio Silva',
        email: 'antonio@faznorte.com',
        cargo: 'administrador',
        dataContratacao: '2018-08-01',
        salario: 9500,
        status: 'ativo',
        telefone: '(62) 99999-0006',
        fazendaId: 3,
        cpf: '678.901.234-56',
        endereco: 'Fazenda Norte, Km 15 - Rio Verde/GO',
        permissoes: getPermissoesPadrao('administrador')
      },
      {
        id: 7,
        nome: 'Luiza Martins',
        email: 'luiza@faznorte.com',
        cargo: 'supervisor',
        dataContratacao: '2019-03-20',
        salario: 6200,
        status: 'ativo',
        telefone: '(62) 99999-0007',
        fazendaId: 3,
        cpf: '789.012.345-67',
        endereco: 'Centro Rural, 890 - Rio Verde/GO',
        permissoes: getPermissoesPadrao('supervisor')
      },
      {
        id: 8,
        nome: 'Fernando Costa',
        email: 'fernando@faznorte.com',
        cargo: 'peao',
        dataContratacao: '2020-06-10',
        salario: 3100,
        status: 'ativo',
        telefone: '(62) 99999-0008',
        fazendaId: 3,
        cpf: '890.123.456-78',
        endereco: 'Vila dos Trabalhadores, 234 - Rio Verde/GO',
        permissoes: getPermissoesPadrao('peao')
      }
    ]
  }
];

// Cultivos iniciais para demonstração
const cultivosIniciais: Cultivo[] = [
  {
    id: 1,
    fazendaId: 1,
    nomeFazenda: 'Fazenda Central',
    cultura: 'Milho',
    tipoCultivo: 'Milho Verão',
    areaHectares: 120.5,
    dataPlantio: '2024-09-15',
    dataColheitaPrevista: '2025-02-15',
    status: 'Crescimento',
    produtividadeEsperada: 8500,
    observacoes: 'Plantio realizado conforme cronograma',
    adubacoes: [
      { tipoAdubo: 'NPK 10-10-10', quantidadeKgHa: 350, dataAplicacao: '2024-09-20' }
    ],
    defensivos: []
  },
  {
    id: 2,
    fazendaId: 1,
    nomeFazenda: 'Fazenda Central',
    cultura: 'Soja',
    tipoCultivo: 'Soja Precoce',
    areaHectares: 95.8,
    dataPlantio: '2024-10-10',
    dataColheitaPrevista: '2025-01-20',
    status: 'Plantado',
    produtividadeEsperada: 3200,
    observacoes: 'Sementes tratadas com inoculante',
    adubacoes: [
      { tipoAdubo: 'Superfosfato Simples', quantidadeKgHa: 200, dataAplicacao: '2024-10-05' }
    ],
    defensivos: []
  },
  {
    id: 3,
    fazendaId: 2,
    nomeFazenda: 'Sítio Esperança',
    cultura: 'Milho',
    tipoCultivo: 'Milho Safrinha',
    areaHectares: 180.3,
    dataPlantio: '2024-08-25',
    dataColheitaPrevista: '2024-12-20',
    status: 'Floração',
    produtividadeEsperada: 7800,
    observacoes: 'Irrigação por aspersão instalada',
    adubacoes: [
      { tipoAdubo: 'Ureia', quantidadeKgHa: 250, dataAplicacao: '2024-09-15' }
    ],
    defensivos: []
  },
  {
    id: 4,
    fazendaId: 3,
    nomeFazenda: 'Fazenda Norte',
    cultura: 'Soja',
    tipoCultivo: 'Soja Tardia',
    areaHectares: 310.2,
    dataPlantio: '2024-11-05',
    dataColheitaPrevista: '2025-03-10',
    status: 'Plantado',
    produtividadeEsperada: 3500,
    observacoes: 'Variedade resistente à ferrugem',
    adubacoes: [
      { tipoAdubo: 'MAP', quantidadeKgHa: 180, dataAplicacao: '2024-11-01' }
    ],
    defensivos: []
  },
  {
    id: 5,
    fazendaId: 3,
    nomeFazenda: 'Fazenda Norte',
    cultura: 'Milho',
    tipoCultivo: 'Milho Verão',
    areaHectares: 150.7,
    dataPlantio: '2024-09-10',
    dataColheitaPrevista: '2025-01-25',
    status: 'Maturação',
    produtividadeEsperada: 9200,
    observacoes: 'Híbrido de alta produtividade',
    adubacoes: [
      { tipoAdubo: 'NPK 08-28-16', quantidadeKgHa: 400, dataAplicacao: '2024-09-05' }
    ],
    defensivos: []
  }
];

const FazendasContext = createContext<FazendasContextData>({} as FazendasContextData);

interface FazendasProviderProps {
  children: ReactNode;
}

export const FazendasProvider: React.FC<FazendasProviderProps> = ({ children }) => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true); // Começa carregando
  const [erro, setErro] = useState<string | null>(null);
  const [apiDisponivel, setApiDisponivel] = useState(false);

  // Verificar conectividade com a API na inicialização
  useEffect(() => {
    const inicializarDados = async () => {
      console.log('🚀 Inicializando FazendasContext...');
      setLoading(true);
      
      try {
        // Primeiro, carregar dados do localStorage se existirem
        const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
        if (fazendasLocal.length > 0) {
          console.log('📂 Carregando fazendas do localStorage primeiro:', fazendasLocal.length);
          setFazendas(fazendasLocal);
          setLoading(false); // Mostra dados locais imediatamente
        }

        // Tentar carregar dados atualizados da API
        console.log('📡 Tentando carregar dados da API...');
        const fazendasAPI_result = await fazendasAPI.listar();
        console.log('📦 Dados recebidos da API:', fazendasAPI_result);
        
        if (fazendasAPI_result && fazendasAPI_result.length > 0) {
          // Mapear dados da API para o formato do frontend
          const fazendasMapeadas = fazendasAPI_result.map(mapearFazendaAPI);
          console.log('🗺️ Fazendas mapeadas da API:', fazendasMapeadas);
          
          // Incluir fazenda criada recentemente se não estiver na API
          const fazendasComBackup = [...fazendasMapeadas];
          
          // Adicionar fazendas locais que não estão na API (recém criadas)
          fazendasLocal.forEach((fazendaLocal: Fazenda) => {
            const existeNaAPI = fazendasMapeadas.find((f: Fazenda) => 
              f.nome === fazendaLocal.nome && f.proprietario === fazendaLocal.proprietario
            );
            if (!existeNaAPI && fazendaLocal.id > 1000) { // IDs temporários são > 1000
              fazendasComBackup.push(fazendaLocal);
            }
          });
          
          setFazendas(fazendasComBackup);
          setApiDisponivel(true);
          
          // Salvar no localStorage
          localStorage.setItem('fazendas', JSON.stringify(fazendasComBackup));
          console.log('💾 Fazendas da API + locais salvas no localStorage');
        } else {
          // API está funcionando mas não tem dados
          console.log('📊 API disponível mas sem dados');
          if (fazendasLocal.length === 0) {
            console.log('🎭 Usando fazendas iniciais');
            setFazendas(fazendasIniciais);
            localStorage.setItem('fazendas', JSON.stringify(fazendasIniciais));
          }
          setApiDisponivel(true);
        }
        
        // Tentar carregar cultivos sempre após fazendas
        try {
          console.log('🌱 Iniciando carregamento de cultivos...');
          await recarregarCultivos();
          console.log('✅ Cultivos carregados com sucesso!');
        } catch (cultivoError) {
          console.warn('⚠️ Erro ao carregar cultivos:', cultivoError);
        }
        
        console.log('✅ Dados carregados com sucesso!');
        
      } catch (error) {
        console.warn('⚠️ Falha ao conectar com a API:', error);
        setApiDisponivel(false);
        
        // Usar dados do localStorage se existirem
        const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
        
        if (fazendasLocal.length > 0) {
          console.log('📂 Usando fazendas do localStorage:', fazendasLocal.length);
          setFazendas(fazendasLocal);
        } else {
          console.log('🎭 Usando fazendas iniciais');
          setFazendas(fazendasIniciais);
          localStorage.setItem('fazendas', JSON.stringify(fazendasIniciais));
        }
      } finally {
        setLoading(false);
      }
    };

    inicializarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para recarregar fazendas da API
  const recarregarFazendas = async () => {
    console.log('🔄 Recarregando fazendas da API...');
    setLoading(true);
    setErro(null);
    
    try {
      const fazendasAPI_result = await fazendasAPI.listar();
      console.log('📦 Dados recebidos da API:', fazendasAPI_result);
      
      // Mapear dados da API para o formato do frontend
      const fazendasMapeadas = fazendasAPI_result.map(mapearFazendaAPI);
      console.log('🗺️ Fazendas mapeadas:', fazendasMapeadas);
      
      setFazendas(fazendasMapeadas);
      
      // Salvar no localStorage como backup
      localStorage.setItem('fazendas', JSON.stringify(fazendasMapeadas));
      console.log('💾 Fazendas salvas no localStorage');
      
    } catch (error) {
      console.error('❌ Erro ao carregar fazendas da API:', error);
      setErro('Erro ao carregar fazendas da API. Usando dados locais.');
      
      // Fallback para dados locais
      const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
      if (fazendasLocal.length > 0) {
        console.log('📂 Carregando fazendas do localStorage:', fazendasLocal);
        setFazendas(fazendasLocal);
      } else {
        console.log('🎭 Usando fazendas iniciais');
        setFazendas(fazendasIniciais);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar nova fazenda
  const adicionarFazenda = async (fazenda: Fazenda) => {
    console.log('➕ Adicionando nova fazenda:', fazenda);
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        console.log('🚀 Enviando para API...');
        // Converter para formato da API
        const fazendaAPI: FazendaAPI = {
          nome: fazenda.nome,
          proprietario: fazenda.proprietario,
          area: fazenda.area,
          localizacao: fazenda.endereco ? 
            `${fazenda.endereco.cidade}, ${fazenda.endereco.estado}` : '',
          telefone: fazenda.telefone || '',
          email: fazenda.email || '',
          status: fazenda.status === 'manutencao' ? 'inativa' : fazenda.status as 'ativa' | 'inativa',
          culturas: fazenda.cultivos
        };

        // Salvar na API
        const novaFazendaAPI = await fazendasAPI.criar(fazendaAPI);
        console.log('✅ Fazenda criada na API:', novaFazendaAPI);
        
        // Mapear dados da API para o formato do frontend
        const fazendaCompleta = mapearFazendaAPI(novaFazendaAPI);
        console.log('🗺️ Fazenda mapeada:', fazendaCompleta);
        
        // Atualizar estado local com dados da API
        setFazendas(prev => {
          const novaLista = [...prev, fazendaCompleta];
          console.log('📝 Estado atualizado. Total de fazendas:', novaLista.length);
          return novaLista;
        });
        
        // Salvar também no localStorage como backup
        const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
        fazendasLocal.push(fazendaCompleta);
        localStorage.setItem('fazendas', JSON.stringify(fazendasLocal));
        console.log('💾 Fazenda salva no localStorage');
        
      } else {
        console.log('⚠️ API indisponível, salvando apenas localmente');
        // Fallback para storage local
        setFazendas(prev => {
          const novaLista = [...prev, fazenda];
          console.log('📝 Estado local atualizado. Total de fazendas:', novaLista.length);
          return novaLista;
        });
        
        // Salvar no localStorage como backup
        const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
        fazendasLocal.push(fazenda);
        localStorage.setItem('fazendas', JSON.stringify(fazendasLocal));
        console.log('💾 Fazenda salva no localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar fazenda:', error);
      setErro('Erro ao salvar fazenda. Salvando localmente.');
      
      // Fallback: salvar localmente mesmo se a API falhar
      setFazendas(prev => [...prev, fazenda]);
      const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
      fazendasLocal.push(fazenda);
      localStorage.setItem('fazendas', JSON.stringify(fazendasLocal));
    } finally {
      setLoading(false);
    }
  };

  // Função para editar fazenda
  const editarFazenda = async (id: number, dadosAtualizados: Partial<Fazenda>) => {
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        // Converter para formato da API
        const fazendaAPI: Partial<FazendaAPI> = {
          nome: dadosAtualizados.nome,
          proprietario: dadosAtualizados.proprietario,
          area: dadosAtualizados.area,
          localizacao: dadosAtualizados.endereco ? 
            `${dadosAtualizados.endereco.cidade}, ${dadosAtualizados.endereco.estado}` : '',
          telefone: dadosAtualizados.telefone || '',
          email: dadosAtualizados.email || '',
          status: dadosAtualizados.status === 'manutencao' ? 'inativa' : dadosAtualizados.status as 'ativa' | 'inativa',
          culturas: dadosAtualizados.cultivos
        };

        // Atualizar na API
        await fazendasAPI.atualizar(id, fazendaAPI);
      }

      // Atualizar estado local
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === id ? { ...fazenda, ...dadosAtualizados } : fazenda
      ));

      // Atualizar localStorage como backup
      const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
      const index = fazendasLocal.findIndex((f: Fazenda) => f.id === id);
      if (index !== -1) {
        fazendasLocal[index] = { ...fazendasLocal[index], ...dadosAtualizados };
        localStorage.setItem('fazendas', JSON.stringify(fazendasLocal));
      }
    } catch (error) {
      console.error('Erro ao editar fazenda:', error);
      setErro('Erro ao atualizar fazenda na API. Dados salvos localmente.');
      
      // Fallback: atualizar localmente mesmo se a API falhar
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === id ? { ...fazenda, ...dadosAtualizados } : fazenda
      ));
    } finally {
      setLoading(false);
    }
  };

  // Função para remover fazenda
  const removerFazenda = async (id: number) => {
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        await fazendasAPI.excluir(id);
      }

      // Remover do estado local
      setFazendas(prev => prev.filter(fazenda => fazenda.id !== id));

      // Remover do localStorage
      const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
      const novasFazendas = fazendasLocal.filter((f: Fazenda) => f.id !== id);
      localStorage.setItem('fazendas', JSON.stringify(novasFazendas));
    } catch (error) {
      console.error('Erro ao remover fazenda:', error);
      setErro('Erro ao remover fazenda da API. Removida localmente.');
      
      // Fallback: remover localmente mesmo se a API falhar
      setFazendas(prev => prev.filter(fazenda => fazenda.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar funcionário
  const adicionarFuncionario = async (fazendaId: number, funcionario: Funcionario) => {
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        const funcionarioAPI: FuncionarioAPI = {
          nome: funcionario.nome,
          email: funcionario.email,
          cargo: funcionario.cargo,
          telefone: funcionario.telefone,
          dataAdmissao: funcionario.dataContratacao,
          salario: funcionario.salario,
          cpf: funcionario.cpf || '',
          endereco: funcionario.endereco || '',
          especialidade: funcionario.especialidade,
          observacoes: funcionario.observacoes,
          fazendaId: fazendaId,
          status: funcionario.status
        };

        await funcionariosAPI.criar(funcionarioAPI);
      }

      // Atualizar estado local
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { ...fazenda, funcionarios: [...fazenda.funcionarios, funcionario] }
          : fazenda
      ));
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      setErro('Erro ao salvar funcionário na API. Salvando localmente.');
      
      // Fallback: salvar localmente
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { ...fazenda, funcionarios: [...fazenda.funcionarios, funcionario] }
          : fazenda
      ));
    } finally {
      setLoading(false);
    }
  };

  // Função para editar funcionário
  const editarFuncionario = async (fazendaId: number, funcionarioId: number, funcionarioAtualizado: Funcionario) => {
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        const funcionarioAPI: Partial<FuncionarioAPI> = {
          nome: funcionarioAtualizado.nome,
          email: funcionarioAtualizado.email,
          cargo: funcionarioAtualizado.cargo,
          telefone: funcionarioAtualizado.telefone,
          salario: funcionarioAtualizado.salario,
          status: funcionarioAtualizado.status
        };

        await funcionariosAPI.atualizar(fazendaId, funcionarioId, funcionarioAPI);
      }

      // Atualizar estado local
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { 
              ...fazenda, 
              funcionarios: fazenda.funcionarios.map(f => 
                f.id === funcionarioId ? funcionarioAtualizado : f
              ) 
            }
          : fazenda
      ));
    } catch (error) {
      console.error('Erro ao editar funcionário:', error);
      setErro('Erro ao atualizar funcionário na API. Dados salvos localmente.');
      
      // Fallback: atualizar localmente
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { 
              ...fazenda, 
              funcionarios: fazenda.funcionarios.map(f => 
                f.id === funcionarioId ? funcionarioAtualizado : f
              ) 
            }
          : fazenda
      ));
    } finally {
      setLoading(false);
    }
  };

  // Função para remover funcionário
  const removerFuncionario = async (fazendaId: number, funcionarioId: number) => {
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        await funcionariosAPI.excluir(fazendaId, funcionarioId);
      }

      // Remover do estado local
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { 
              ...fazenda, 
              funcionarios: fazenda.funcionarios.filter(f => f.id !== funcionarioId) 
            }
          : fazenda
      ));
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      setErro('Erro ao remover funcionário da API. Removido localmente.');
      
      // Fallback: remover localmente mesmo se a API falhar
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === fazendaId 
          ? { 
              ...fazenda, 
              funcionarios: fazenda.funcionarios.filter(f => f.id !== funcionarioId) 
            }
          : fazenda
      ));
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar status da fazenda
  const alterarStatusFazenda = async (id: number, novoStatus: 'ativa' | 'inativa' | 'manutencao') => {
    console.log(`🔄 Iniciando alteração de status da fazenda ${id} para: ${novoStatus}`);
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        // Converter status para formato esperado pela API
        const statusAPI = novoStatus === 'manutencao' ? 'inativa' : novoStatus as 'ativa' | 'inativa';
        console.log(`📡 Enviando para API status: ${statusAPI}`);
        await fazendasAPI.atualizar(id, { status: statusAPI });
        console.log(`✅ API atualizada com sucesso`);
      }

      // Atualizar no estado local
      setFazendas(prev => {
        const novasFazendas = prev.map(fazenda => 
          fazenda.id === id ? { ...fazenda, status: novoStatus } : fazenda
        );
        console.log(`🏠 Estado local atualizado:`, novasFazendas.find(f => f.id === id));
        return novasFazendas;
      });

      // Atualizar no localStorage
      const fazendasLocal = JSON.parse(localStorage.getItem('fazendas') || '[]');
      const novasFazendas = fazendasLocal.map((f: Fazenda) => 
        f.id === id ? { ...f, status: novoStatus } : f
      );
      localStorage.setItem('fazendas', JSON.stringify(novasFazendas));
      console.log(`💾 localStorage atualizado`);

      console.log(`✅ Status da fazenda ${id} alterado para: ${novoStatus}`);
    } catch (error) {
      console.error('❌ Erro ao alterar status da fazenda:', error);
      setErro('Erro ao alterar status da fazenda na API. Alterado localmente.');
      
      // Fallback: alterar localmente mesmo se a API falhar
      setFazendas(prev => prev.map(fazenda => 
        fazenda.id === id ? { ...fazenda, status: novoStatus } : fazenda
      ));
      console.log(`🔄 Fallback: Status alterado apenas localmente`);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🌱 FUNÇÕES DE CULTIVOS
  // ========================

  // Função para recarregar cultivos da API
  const recarregarCultivos = async () => {
    console.log('🔄 Recarregando cultivos da API...');
    setLoading(true);
    setErro(null);
    
    try {
      const response = await buscarCultivos();
      console.log('📦 [CULTIVOS] Resposta completa da API:', response);
      
      // A API retorna { success: true, data: [...], total: N }
      if (response && response.success && response.data && Array.isArray(response.data)) {
        console.log('📋 [CULTIVOS] Dados válidos recebidos:', response.data.length, 'cultivos');
        
        const cultivosFormatados = response.data.map((cultivo: any) => ({
          id: cultivo.id,
          fazendaId: cultivo.fazendaId,
          nomeFazenda: cultivo.nomeFazenda || '',
          talhao: cultivo.talhao || '',
          responsavelTecnico: cultivo.responsavelTecnico || '',
          cultura: cultivo.tipoCultura, // Mapear tipoCultura para cultura
          tipoCultivo: cultivo.variedade || cultivo.tipoCultura,
          areaHectares: cultivo.areaHectares,
          dataPlantio: cultivo.dataPlantio,
          dataColheitaPrevista: cultivo.dataColheitaPrevista,
          dataColheitaReal: cultivo.dataColheitaReal,
          status: mapStatusFromAPI(cultivo.status),
          produtividadeEsperada: cultivo.producaoEstimadaTon ? Math.round(cultivo.producaoEstimadaTon * 1000 / cultivo.areaHectares) : 0,
          produtividadeReal: cultivo.produtividadeReal,
          tipoSolo: cultivo.tipoSolo,
          precipitacaoMm: cultivo.precipitacaoMm,
          observacoes: cultivo.observacoes || '',
          adubacoes: cultivo.adubacoes || [],
          defensivos: cultivo.defensivos || [],
          criadoEm: cultivo.criadoEm,
          atualizadoEm: cultivo.atualizadoEm,
          // Campos de compatibilidade
          tipoCultura: cultivo.tipoCultura,
          variedade: cultivo.variedade,
          producaoEstimadaTon: cultivo.producaoEstimadaTon,
          fertilizanteTipo: cultivo.fertilizanteTipo,
          fertilizanteQuantidade: cultivo.fertilizanteQuantidade,
          irrigacao: cultivo.irrigacao
        }));
        
        console.log('🔄 [CULTIVOS] Formatados para frontend:', cultivosFormatados.length, 'cultivos');
        console.log('📊 [CULTIVOS] Distribuição por cultura:', {
          milho: cultivosFormatados.filter((c: any) => c.cultura === 'Milho').length,
          soja: cultivosFormatados.filter((c: any) => c.cultura === 'Soja').length
        });
        
        setCultivos(cultivosFormatados);
        
        // Salvar no localStorage como backup
        localStorage.setItem('cultivos', JSON.stringify(cultivosFormatados));
        console.log('💾 [CULTIVOS] Salvos no localStorage. Total:', cultivosFormatados.length);
        
      } else if (response && response.data) {
        // Fallback para resposta antiga
        const cultivosFormatados = response.data.map((cultivo: any) => ({
          ...cultivo,
          tipoCultura: cultivo.tipoCultura,
          areaHectares: cultivo.areaHectares,
          status: cultivo.status
        }));
        setCultivos(cultivosFormatados);
        
        // Salvar no localStorage como backup
        localStorage.setItem('cultivos', JSON.stringify(cultivosFormatados));
        console.log('✅ [CULTIVOS] Carregados da API (formato antigo):', cultivosFormatados);
      } else {
        console.log('⚠️ [CULTIVOS] Resposta inválida:', response);
        setCultivos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cultivos da API:', error);
      setErro('Erro ao carregar cultivos da API.');
      
      // Fallback: tentar carregar do localStorage
      const cultivosLocal = JSON.parse(localStorage.getItem('cultivos') || '[]');
      if (cultivosLocal.length > 0) {
        console.log('📂 Usando cultivos do localStorage:', cultivosLocal.length);
        setCultivos(cultivosLocal);
      } else {
        // Se não há dados locais, usar dados demo para o dashboard funcionar
        console.log('� Carregando dados demo de cultivos para o dashboard...');
        setCultivos(cultivosIniciais);
        localStorage.setItem('cultivos', JSON.stringify(cultivosIniciais));
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para converter status de Cultivo para API
  const mapStatusToAPI = (status: 'Plantado' | 'Crescimento' | 'Floração' | 'Maturação' | 'Colhido'): 'plantado' | 'crescimento' | 'colhido' | 'perdido' => {
    switch (status) {
      case 'Plantado': return 'plantado';
      case 'Crescimento': return 'crescimento';
      case 'Floração': return 'crescimento';
      case 'Maturação': return 'crescimento';
      case 'Colhido': return 'colhido';
      default: return 'plantado';
    }
  };

  // Função para converter status de API para Cultivo
  const mapStatusFromAPI = (status: 'plantado' | 'crescimento' | 'colhido' | 'perdido'): 'Plantado' | 'Crescimento' | 'Floração' | 'Maturação' | 'Colhido' => {
    switch (status) {
      case 'plantado': return 'Plantado';
      case 'crescimento': return 'Crescimento';
      case 'colhido': return 'Colhido';
      case 'perdido': return 'Colhido'; // Mapear perdido para colhido
      default: return 'Plantado';
    }
  };

  // Função para adicionar cultivo
  const adicionarCultivo = async (cultivo: Cultivo) => {
    console.log('➕ Adicionando novo cultivo:', cultivo);
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        console.log('🚀 Enviando cultivo para API...');
        const cultivoAPI: CultivoAPI = {
          fazendaId: cultivo.fazendaId,
          tipoCultura: cultivo.cultura || (cultivo.tipoCultivo?.includes('Milho') ? 'Milho' : 'Soja'),
          variedade: cultivo.variedade || cultivo.tipoCultivo || 'Padrão',
          areaHectares: cultivo.areaHectares,
          dataPlantio: cultivo.dataPlantio,
          dataColheitaPrevista: cultivo.dataColheitaPrevista,
          status: mapStatusToAPI(cultivo.status),
          producaoEstimadaTon: cultivo.producaoEstimadaTon,
          fertilizanteTipo: cultivo.fertilizanteTipo,
          fertilizanteQuantidade: cultivo.fertilizanteQuantidade,
          irrigacao: cultivo.irrigacao,
          observacoes: cultivo.observacoes
        };

        const response = await criarCultivo(cultivoAPI);
        if (response && response.data) {
          // Usar dados da API
          setCultivos(prev => [...prev, response.data]);
          
          // Salvar no localStorage como backup
          const cultivosLocal = JSON.parse(localStorage.getItem('cultivos') || '[]');
          cultivosLocal.push(response.data);
          localStorage.setItem('cultivos', JSON.stringify(cultivosLocal));
          
          console.log('✅ Cultivo criado na API:', response.data);
        }
      } else {
        console.log('⚠️ API indisponível, salvando apenas localmente');
        // Fallback para storage local
        const novoCultivoLocal: Cultivo = {
          ...cultivo,
          id: Date.now(), // ID temporário
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        
        setCultivos(prev => [...prev, novoCultivoLocal]);
        
        // Salvar no localStorage como backup
        const cultivosLocal = JSON.parse(localStorage.getItem('cultivos') || '[]');
        cultivosLocal.push(novoCultivoLocal);
        localStorage.setItem('cultivos', JSON.stringify(cultivosLocal));
        
        console.log('✅ Cultivo salvo localmente:', novoCultivoLocal);
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar cultivo:', error);
      setErro('Erro ao salvar cultivo.');
    } finally {
      setLoading(false);
    }
  };

  // Função para editar cultivo
  const editarCultivo = async (id: number, dadosAtualizados: Partial<Cultivo>) => {
    console.log('✏️ Editando cultivo:', id, dadosAtualizados);
    setLoading(true);
    setErro(null);

    try {
      if (apiDisponivel) {
        console.log('🚀 Atualizando cultivo na API...');
        const dadosAPI: Partial<CultivoAPI> = {
          ...dadosAtualizados,
          tipoCultura: dadosAtualizados.cultura || 
            (dadosAtualizados.tipoCultivo?.includes('Milho') ? 'Milho' : 'Soja'),
          variedade: dadosAtualizados.tipoCultivo || dadosAtualizados.variedade,
          status: dadosAtualizados.status ? mapStatusToAPI(dadosAtualizados.status) : undefined
        };
        
        const response = await atualizarCultivo(id, dadosAPI);
        if (response && response.data) {
          setCultivos(prev => prev.map(cultivo => 
            cultivo.id === id ? response.data : cultivo
          ));
          
          // Atualizar localStorage
          const cultivosLocal = JSON.parse(localStorage.getItem('cultivos') || '[]');
          const cultivosAtualizados = cultivosLocal.map((c: any) => 
            c.id === id ? response.data : c
          );
          localStorage.setItem('cultivos', JSON.stringify(cultivosAtualizados));
          
          console.log('✅ Cultivo atualizado na API:', response.data);
        }
      } else {
        console.log('⚠️ API indisponível, atualizando apenas localmente');
        // Fallback para storage local
        setCultivos(prev => prev.map(cultivo => 
          cultivo.id === id ? { ...cultivo, ...dadosAtualizados, atualizadoEm: new Date().toISOString() } : cultivo
        ));
        
        // Atualizar localStorage
        const cultivosLocal = JSON.parse(localStorage.getItem('cultivos') || '[]');
        const cultivosAtualizados = cultivosLocal.map((c: any) => 
          c.id === id ? { ...c, ...dadosAtualizados, atualizadoEm: new Date().toISOString() } : c
        );
        localStorage.setItem('cultivos', JSON.stringify(cultivosAtualizados));
        
        console.log('✅ Cultivo atualizado localmente');
      }
      
    } catch (error) {
      console.error('❌ Erro ao editar cultivo:', error);
      setErro('Erro ao atualizar cultivo.');
    } finally {
      setLoading(false);
    }
  };

  // Função para remover cultivo
  const removerCultivo = async (id: number) => {
    console.log('🗑️ Removendo cultivo:', id);
    setLoading(true);
    setErro(null);

    try {
      await removerCultivoAPI(id);
      setCultivos(prev => prev.filter(cultivo => cultivo.id !== id));
      console.log('✅ Cultivo removido da API');
      
    } catch (error) {
      console.error('❌ Erro ao remover cultivo:', error);
      setErro('Erro ao remover cultivo da API.');
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar status de cultivo
  const alterarStatusCultivo = async (id: number, novoStatus: 'plantado' | 'crescimento' | 'colhido' | 'perdido') => {
    console.log('🔄 Alterando status do cultivo:', id, 'para:', novoStatus);
    setLoading(true);
    setErro(null);

    try {
      const response = await atualizarStatusCultivo(id, novoStatus);
      if (response && response.data) {
        setCultivos(prev => prev.map(cultivo => 
          cultivo.id === id ? response.data : cultivo
        ));
        console.log('✅ Status do cultivo atualizado na API:', response.data);
      }
      
    } catch (error) {
      console.error('❌ Erro ao alterar status do cultivo:', error);
      setErro('Erro ao alterar status do cultivo na API.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar cultivos na inicialização
  useEffect(() => {
    recarregarCultivos();
  }, []);

  // Função para mapear dados da API para o formato do frontend
  const mapearFazendaAPI = (fazendaAPI: any): Fazenda => {
    // Função helper para preservar encoding UTF-8
    const preservarUTF8 = (texto: string | null | undefined): string => {
      if (!texto) return '';
      // Garantir que o texto seja tratado como UTF-8
      return String(texto).normalize('NFC');
    };

    return {
      id: fazendaAPI.id,
      nome: preservarUTF8(fazendaAPI.nome),
      area: fazendaAPI.area,
      status: fazendaAPI.status?.toLowerCase() || 'ativa',
      cultivos: fazendaAPI.cultivos || [],
      endereco: {
        rua: preservarUTF8(fazendaAPI.endereco?.rua || ''),
        cidade: preservarUTF8(fazendaAPI.cidade || fazendaAPI.endereco?.cidade || ''),
        estado: preservarUTF8(fazendaAPI.estado || fazendaAPI.endereco?.estado || ''),
        cep: preservarUTF8(fazendaAPI.cep || fazendaAPI.endereco?.cep || '')
      },
      proprietario: preservarUTF8(fazendaAPI.proprietario),
      dataAquisicao: fazendaAPI.dataAquisicao || new Date().toISOString(),
      valorCompra: fazendaAPI.valorCompra || 0,
      producaoAnual: fazendaAPI.producaoAnual || 0,
      custoOperacional: fazendaAPI.custoOperacional || 0,
      telefone: preservarUTF8(fazendaAPI.telefone || ''),
      email: preservarUTF8(fazendaAPI.email || ''),
      realizaRacao: fazendaAPI.realizaRacao || false,
      realizaNutricao: fazendaAPI.realizaNutricao || false,
      funcionarios: fazendaAPI.funcionarios?.map((func: any) => ({
        id: func.id,
        nome: preservarUTF8(func.nome),
        email: preservarUTF8(func.email),
        cargo: func.cargo?.toLowerCase() || 'peao',
        dataContratacao: func.dataContratacao || func.criadoEm,
        salario: func.salario || 0,
        status: func.status?.toLowerCase() || 'ativo',
        telefone: func.telefone || '',
        fazendaId: func.fazendaId,
        cpf: func.cpf || '',
        endereco: func.endereco || '',
        especialidade: func.especialidade || '',
        observacoes: func.observacoes || '',
        permissoes: getPermissoesPadrao(func.cargo?.toLowerCase() || 'peao')
      })) || []
    };
  };

  return (
    <FazendasContext.Provider value={{
      // Estados
      fazendas,
      cultivos,
      loading,
      erro,
      setFazendas,
      setCultivos,
      // Fazendas
      adicionarFazenda,
      editarFazenda,
      removerFazenda,
      alterarStatusFazenda,
      // Funcionários
      adicionarFuncionario,
      editarFuncionario,
      removerFuncionario,
      // Cultivos
      adicionarCultivo,
      editarCultivo,
      removerCultivo,
      alterarStatusCultivo,
      // Utilitários
      recarregarFazendas,
      recarregarCultivos
    }}>
      {children}
    </FazendasContext.Provider>
  );
};

export const useFazendas = () => {
  const context = useContext(FazendasContext);
  if (!context) {
    throw new Error('useFazendas deve ser usado dentro de um FazendasProvider');
  }
  return context;
};

export type { Fazenda, Funcionario, Permissao, Cultivo };
