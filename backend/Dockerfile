# Dockerfile para o Backend do Sistema Agropecuário
# Usa Node.js 18 Alpine para um container leve e seguro

FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências primeiro (para otimizar cache do Docker)
COPY package*.json ./

# Instala as dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copia o código fonte da aplicação
COPY . .

# Gera o cliente Prisma e compila o TypeScript
RUN npx prisma generate && npm run build

# Cria um usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S systemagro -u 1001

# Muda a propriedade dos arquivos para o usuário não-root
USER systemagro

# Expõe a porta da aplicação
EXPOSE 3001

# Define variáveis de ambiente de produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["npm", "start"]
