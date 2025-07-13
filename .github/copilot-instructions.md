<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Sistema Agropecuário - Instruções para o GitHub Copilot

Este é um projeto de sistema agropecuário completo com frontend React/TypeScript e backend Node.js/Express, utilizando PostgreSQL e Docker.

## Contexto do Projeto

O **Sistema Agropecuário** é uma aplicação web moderna para gestão completa de fazendas, incluindo:

- 🧑‍🌾 **Gestão de Fazendas**: Cadastro e controle de propriedades rurais
- 🌱 **Cultivos**: Controle de plantio, crescimento e colheita
- 🧪 **Adubagem**: Gestão de fertilizantes e aplicações
- 💰 **Vendas**: Registro e acompanhamento de vendas de produtos
- 📦 **Estoque**: Controle de ração e insumos agrícolas
- 📊 **Dashboard BI**: Métricas e gráficos para tomada de decisão
- 📱 **Interface Responsiva**: Funciona em mobile, tablet e desktop
- 🌙 **Tema Claro/Escuro**: Alternância de temas
- 📁 **Importação Excel**: Upload e processamento de planilhas

## Arquitetura e Tecnologias

### Frontend (React + TypeScript)
- **React 18** com TypeScript
- **TailwindCSS** para estilização
- **Recharts** para gráficos e dashboards
- **Lucide React** para ícones
- **Context API** para gerenciamento de estado (tema, auth)
- **Axios** para requisições HTTP

### Backend (Node.js + Express)
- **Node.js** com Express e TypeScript
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Swagger** para documentação da API
- **Multer** para upload de arquivos
- **XLSX** para processamento de planilhas Excel
- **Express Validator** para validação de dados

### DevOps
- **Docker** e **Docker Compose** para containerização
- **Nginx** como proxy reverso (se necessário)

## Padrões de Desenvolvimento

### Estrutura de Arquivos
```
backend/src/
├── routes/          # Rotas da API REST
├── middleware/      # Middlewares de autenticação, validação
├── models/         # Modelos de dados (se usar ORM)
├── utils/          # Utilitários e helpers
└── server.ts       # Servidor principal

frontend/src/
├── components/     # Componentes React reutilizáveis
├── context/        # Contextos React (Theme, Auth)
├── pages/          # Páginas da aplicação
├── utils/          # Utilitários e helpers
└── App.tsx         # Componente principal
```

### Padrões de Código

#### Backend
- Use **TypeScript** com tipagem rigorosa
- Implemente **validação de entrada** em todas as rotas
- Use **middleware de autenticação** para rotas protegidas
- Documente todas as rotas com **comentários Swagger**
- Trate erros de forma consistente com **try/catch**
- Use **arrow functions** e **async/await**

#### Frontend
- Use **TypeScript** para todos os componentes
- Implemente **props interfaces** para todos os componentes
- Use **TailwindCSS** para estilização (evite CSS customizado)
- Implemente **responsividade** com classes Tailwind
- Use **hooks** React (useState, useEffect, useContext)
- Documente componentes complexos com comentários JSDoc

### Convenções de Nomenclatura
- **Componentes React**: PascalCase (ex: `Dashboard.tsx`, `UserCard.tsx`)
- **Hooks customizados**: camelCase com prefixo "use" (ex: `useTheme`, `useAuth`)
- **Rotas da API**: kebab-case (ex: `/api/fazendas`, `/api/cultivos`)
- **Variáveis e funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces TypeScript**: PascalCase com sufixo adequado (ex: `FazendaProps`, `UserData`)

### Funcionalidades Específicas

#### Dashboard BI
- Use **Recharts** para todos os gráficos
- Implemente **métricas responsivas** com cards
- Use **grid system** do Tailwind para layout
- Implemente **loading states** para dados assíncronos

#### Tema Claro/Escuro
- Use o **ThemeContext** para gerenciar tema
- Aplique classes `dark:` do Tailwind consistentemente
- Persista preferência no **localStorage**
- Respeite preferência do sistema quando possível

#### Importação Excel
- Use **Multer** para upload de arquivos
- Valide **tipos de arquivo** (.xlsx, .xls)
- Implemente **validação de dados** linha por linha
- Forneça **feedback detalhado** de erros
- Ofereça **templates** para download

#### Responsividade
- Use breakpoints Tailwind: `sm:`, `md:`, `lg:`, `xl:`
- Priorize **mobile-first** design
- Implemente **sidebar colapsível** para mobile
- Use **grid** e **flexbox** apropriadamente

### Exemplos de Código

#### Componente React com TypeScript
```typescript
interface CardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, onClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Conteúdo do card */}
    </div>
  );
};
```

#### Rota da API com validação
```typescript
/**
 * @swagger
 * /api/fazendas:
 *   post:
 *     summary: Cria uma nova fazenda
 *     tags: [Fazendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fazenda'
 */
router.post('/', [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('hectares').isFloat({ min: 0.1 }).withMessage('Hectares deve ser positivo')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Lógica da rota
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## Domínio de Negócio

### Entidades Principais
- **Fazenda**: Propriedade rural com nome, proprietário, área em hectares, localização
- **Cultivo**: Plantio em uma fazenda com cultura, área, datas, status, produção
- **Adubo**: Aplicação de fertilizantes com tipo, quantidade, área, custo
- **Venda**: Transação de venda com produto, quantidade, valor, comprador
- **Estoque**: Item em estoque com categoria (ração/fertilizante), quantidade, valor

### Estados e Fluxos
- **Cultivo**: plantado → crescimento → colhido/perdido
- **Estoque**: entrada → em estoque → saída
- **Venda**: pendente → confirmada → entregue

### Validações de Negócio
- Área plantada não pode exceder área total da fazenda
- Datas de plantio devem ser anteriores à colheita
- Quantidades devem ser sempre positivas
- Status de cultivo devem seguir fluxo lógico

## Instruções Específicas para Copilot

1. **Sempre use TypeScript** com interfaces bem definidas
2. **Implemente responsividade** com TailwindCSS
3. **Documente APIs** com comentários Swagger
4. **Valide todas as entradas** de dados
5. **Trate erros** de forma consistente
6. **Use componentes reutilizáveis** sempre que possível
7. **Implemente loading states** para melhor UX
8. **Siga convenções de nomenclatura** estabelecidas
9. **Teste responsividade** em diferentes telas
10. **Mantenha consistência** com o design system

Quando sugerir código, considere sempre o contexto agropecuário e as funcionalidades específicas deste sistema.
