#!/usr/bin/env node
/**
 * Script de Verificação Automática de Segurança
 * Azure Security Benchmark v3 Compliance Check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecurityChecker {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      score: 0
    };
    this.projectRoot = process.cwd();
  }

  /**
   * Executa todas as verificações de segurança
   */
  async runAllChecks() {
    console.log('🔒 Iniciando verificação completa de segurança...\n');
    
    // Lista de verificações
    const checks = [
      { name: 'Environment Variables', method: this.checkEnvironmentVariables },
      { name: 'Dependencies Security', method: this.checkDependenciesSecurity },
      { name: 'Code Quality', method: this.checkCodeQuality },
      { name: 'Authentication Setup', method: this.checkAuthenticationSetup },
      { name: 'HTTPS Configuration', method: this.checkHTTPSConfiguration },
      { name: 'Input Validation', method: this.checkInputValidation },
      { name: 'Error Handling', method: this.checkErrorHandling },
      { name: 'Logging Configuration', method: this.checkLoggingConfiguration },
      { name: 'CORS Configuration', method: this.checkCORSConfiguration },
      { name: 'Rate Limiting', method: this.checkRateLimiting },
      { name: 'Security Headers', method: this.checkSecurityHeaders },
      { name: 'Database Security', method: this.checkDatabaseSecurity },
      { name: 'File Upload Security', method: this.checkFileUploadSecurity },
      { name: 'Azure Integration', method: this.checkAzureIntegration },
    ];

    // Executar verificações
    for (const check of checks) {
      try {
        console.log(`🔍 Verificando: ${check.name}`);
        await check.method.call(this);
        console.log(`✅ ${check.name}: PASSOU\n`);
      } catch (error) {
        console.log(`❌ ${check.name}: FALHOU - ${error.message}\n`);
      }
    }

    this.generateReport();
  }

  /**
   * 1. Verificar variáveis de ambiente
   */
  checkEnvironmentVariables() {
    const requiredVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'DATABASE_URL',
      'BCRYPT_ROUNDS',
      'NODE_ENV'
    ];

    const envExample = path.join(this.projectRoot, '.env.example');
    if (!fs.existsSync(envExample)) {
      throw new Error('.env.example não encontrado');
    }

    const missingVars = requiredVars.filter(varName => {
      const value = process.env[varName];
      return !value || value.length < 8;
    });

    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente não configuradas: ${missingVars.join(', ')}`);
    }

    // Verificar força das chaves
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      this.results.warnings.push('JWT_SECRET deve ter pelo menos 32 caracteres');
    }

    this.results.passed.push('Variáveis de ambiente configuradas corretamente');
  }

  /**
   * 2. Verificar segurança das dependências
   */
  checkDependenciesSecurity() {
    try {
      // NPM Audit
      const auditResult = execSync('npm audit --audit-level=moderate --json', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditResult);
      if (audit.metadata.vulnerabilities.total > 0) {
        throw new Error(`${audit.metadata.vulnerabilities.total} vulnerabilidades encontradas`);
      }

      // Verificar dependências outdated
      try {
        execSync('npm outdated', { cwd: this.projectRoot, stdio: 'pipe' });
      } catch (error) {
        this.results.warnings.push('Algumas dependências estão desatualizadas');
      }

      this.results.passed.push('Dependências seguras e atualizadas');
    } catch (error) {
      if (error.message.includes('vulnerabilidades')) {
        throw error;
      }
      throw new Error('Falha ao verificar dependências');
    }
  }

  /**
   * 3. Verificar qualidade do código
   */
  checkCodeQuality() {
    // Verificar se ESLint está configurado
    const eslintConfig = path.join(this.projectRoot, '.eslintrc.json');
    if (!fs.existsSync(eslintConfig)) {
      throw new Error('ESLint não configurado');
    }

    // Verificar regras de segurança
    const eslintConfigContent = JSON.parse(fs.readFileSync(eslintConfig, 'utf8'));
    const securityPlugins = eslintConfigContent.plugins || [];
    if (!securityPlugins.includes('security')) {
      throw new Error('Plugin de segurança do ESLint não configurado');
    }

    // Executar ESLint
    try {
      execSync('npm run lint:check', { cwd: this.projectRoot, stdio: 'pipe' });
      this.results.passed.push('Código passa em todas as verificações de qualidade');
    } catch (error) {
      throw new Error('Código não passa nas verificações do ESLint');
    }
  }

  /**
   * 4. Verificar configuração de autenticação
   */
  checkAuthenticationSetup() {
    const authFile = path.join(this.projectRoot, 'src/middleware/auth-secure.ts');
    if (!fs.existsSync(authFile)) {
      throw new Error('Middleware de autenticação segura não encontrado');
    }

    const authContent = fs.readFileSync(authFile, 'utf8');
    
    // Verificar se JWT está implementado
    if (!authContent.includes('jsonwebtoken')) {
      throw new Error('JWT não implementado na autenticação');
    }

    // Verificar se bcrypt está implementado
    if (!authContent.includes('bcrypt')) {
      throw new Error('bcrypt não implementado para hash de senhas');
    }

    // Verificar se MFA está implementado
    if (!authContent.includes('speakeasy')) {
      this.results.warnings.push('MFA (Multi-Factor Authentication) não implementado');
    }

    this.results.passed.push('Sistema de autenticação seguro configurado');
  }

  /**
   * 5. Verificar configuração HTTPS
   */
  checkHTTPSConfiguration() {
    const serverFile = path.join(this.projectRoot, 'src/server-secure.ts');
    if (!fs.existsSync(serverFile)) {
      throw new Error('Servidor seguro não configurado');
    }

    const serverContent = fs.readFileSync(serverFile, 'utf8');
    
    if (!serverContent.includes('https')) {
      this.results.warnings.push('HTTPS não configurado');
    }

    if (!serverContent.includes('helmet')) {
      throw new Error('Headers de segurança (helmet) não configurados');
    }

    this.results.passed.push('Configuração HTTPS e headers de segurança OK');
  }

  /**
   * 6. Verificar validação de entrada
   */
  checkInputValidation() {
    const securityMiddleware = path.join(this.projectRoot, 'src/middleware/security.ts');
    if (!fs.existsSync(securityMiddleware)) {
      throw new Error('Middleware de segurança não encontrado');
    }

    const content = fs.readFileSync(securityMiddleware, 'utf8');
    
    if (!content.includes('express-validator')) {
      throw new Error('express-validator não implementado');
    }

    if (!content.includes('DOMPurify')) {
      throw new Error('Sanitização de entrada não implementada');
    }

    this.results.passed.push('Validação e sanitização de entrada configuradas');
  }

  /**
   * 7. Verificar tratamento de erros
   */
  checkErrorHandling() {
    const serverFiles = [
      'src/server.ts',
      'src/server-secure.ts'
    ];

    let hasErrorHandling = false;
    for (const file of serverFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('error') && content.includes('middleware')) {
          hasErrorHandling = true;
          break;
        }
      }
    }

    if (!hasErrorHandling) {
      throw new Error('Middleware de tratamento de erros não encontrado');
    }

    this.results.passed.push('Tratamento de erros configurado');
  }

  /**
   * 8. Verificar configuração de logs
   */
  checkLoggingConfiguration() {
    const loggerFile = path.join(this.projectRoot, 'src/utils/logger.ts');
    if (!fs.existsSync(loggerFile)) {
      throw new Error('Sistema de logs não configurado');
    }

    const loggerContent = fs.readFileSync(loggerFile, 'utf8');
    
    if (!loggerContent.includes('winston')) {
      throw new Error('Winston logger não configurado');
    }

    if (!loggerContent.includes('auditLogger')) {
      throw new Error('Logger de auditoria não configurado');
    }

    if (!loggerContent.includes('securityLogger')) {
      throw new Error('Logger de segurança não configurado');
    }

    this.results.passed.push('Sistema de logs e auditoria configurado');
  }

  /**
   * 9. Verificar configuração CORS
   */
  checkCORSConfiguration() {
    const securityFile = path.join(this.projectRoot, 'src/middleware/security.ts');
    if (!fs.existsSync(securityFile)) {
      throw new Error('Middleware de segurança não encontrado');
    }

    const content = fs.readFileSync(securityFile, 'utf8');
    
    if (!content.includes('cors')) {
      throw new Error('CORS não configurado');
    }

    if (content.includes("origin: '*'")) {
      throw new Error('CORS configurado de forma permissiva (perigoso)');
    }

    this.results.passed.push('CORS configurado de forma restritiva');
  }

  /**
   * 10. Verificar rate limiting
   */
  checkRateLimiting() {
    const securityFile = path.join(this.projectRoot, 'src/middleware/security.ts');
    if (!fs.existsSync(securityFile)) {
      throw new Error('Middleware de segurança não encontrado');
    }

    const content = fs.readFileSync(securityFile, 'utf8');
    
    if (!content.includes('express-rate-limit')) {
      throw new Error('Rate limiting não configurado');
    }

    this.results.passed.push('Rate limiting configurado');
  }

  /**
   * 11. Verificar headers de segurança
   */
  checkSecurityHeaders() {
    const securityFile = path.join(this.projectRoot, 'src/middleware/security.ts');
    if (!fs.existsSync(securityFile)) {
      throw new Error('Middleware de segurança não encontrado');
    }

    const content = fs.readFileSync(securityFile, 'utf8');
    
    const requiredHeaders = [
      'helmet',
      'contentSecurityPolicy',
      'hsts',
      'noSniff'
    ];

    const missingHeaders = requiredHeaders.filter(header => !content.includes(header));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Headers de segurança não configurados: ${missingHeaders.join(', ')}`);
    }

    this.results.passed.push('Headers de segurança configurados');
  }

  /**
   * 12. Verificar segurança do banco de dados
   */
  checkDatabaseSecurity() {
    const prismaSchema = path.join(this.projectRoot, 'prisma/schema.prisma');
    if (!fs.existsSync(prismaSchema)) {
      this.results.warnings.push('Schema Prisma não encontrado');
      return;
    }

    // Verificar se a URL do banco tem SSL
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && !databaseUrl.includes('sslmode=require')) {
      this.results.warnings.push('SSL não obrigatório na conexão do banco');
    }

    this.results.passed.push('Configuração de segurança do banco verificada');
  }

  /**
   * 13. Verificar segurança de upload de arquivos
   */
  checkFileUploadSecurity() {
    // Verificar se multer está configurado com limites
    const uploadsConfig = path.join(this.projectRoot, 'src/middleware/upload.ts');
    if (!fs.existsSync(uploadsConfig)) {
      this.results.warnings.push('Middleware de upload não encontrado');
      return;
    }

    const content = fs.readFileSync(uploadsConfig, 'utf8');
    if (!content.includes('fileSize') && !content.includes('fileFilter')) {
      this.results.warnings.push('Limites de upload não configurados');
    }

    this.results.passed.push('Segurança de upload configurada');
  }

  /**
   * 14. Verificar integração Azure
   */
  checkAzureIntegration() {
    const azureFile = path.join(this.projectRoot, 'src/utils/azure-keyvault.ts');
    if (!fs.existsSync(azureFile)) {
      this.results.warnings.push('Azure Key Vault não configurado');
      return;
    }

    const content = fs.readFileSync(azureFile, 'utf8');
    if (!content.includes('@azure/keyvault-secrets')) {
      throw new Error('Azure Key Vault SDK não configurado');
    }

    this.results.passed.push('Integração Azure configurada');
  }

  /**
   * Gerar relatório final
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 RELATÓRIO DE SEGURANÇA - SISTEMA AGROPECUÁRIO');
    console.log('='.repeat(60));
    
    const total = this.results.passed.length + this.results.failed.length;
    const score = Math.round((this.results.passed.length / total) * 100);
    
    console.log(`\n📊 SCORE DE SEGURANÇA: ${score}%`);
    console.log(`✅ Verificações aprovadas: ${this.results.passed.length}`);
    console.log(`❌ Verificações falharam: ${this.results.failed.length}`);
    console.log(`⚠️  Avisos: ${this.results.warnings.length}`);
    
    if (this.results.passed.length > 0) {
      console.log('\n✅ VERIFICAÇÕES APROVADAS:');
      this.results.passed.forEach(item => console.log(`  • ${item}`));
    }
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ VERIFICAÇÕES FALHARAM:');
      this.results.failed.forEach(item => console.log(`  • ${item}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  AVISOS:');
      this.results.warnings.forEach(item => console.log(`  • ${item}`));
    }
    
    console.log('\n📋 RECOMENDAÇÕES AZURE SECURITY BENCHMARK v3:');
    console.log('  • Mantenha todas as dependências atualizadas');
    console.log('  • Configure Azure Key Vault para produção');
    console.log('  • Habilite Azure Monitor para logs');
    console.log('  • Configure Azure Application Gateway com WAF');
    console.log('  • Implemente Azure AD para autenticação');
    
    console.log('\n🔗 PRÓXIMOS PASSOS:');
    if (score < 80) {
      console.log('  • Resolva as verificações que falharam');
      console.log('  • Implemente as funcionalidades em aviso');
    } else {
      console.log('  • Mantenha as configurações de segurança atualizadas');
      console.log('  • Execute verificações regulares');
    }
    
    console.log(`\n📅 Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(60));
    
    // Salvar relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      score,
      passed: this.results.passed,
      failed: this.results.failed,
      warnings: this.results.warnings
    };
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'security-report.json'),
      JSON.stringify(reportData, null, 2)
    );
    
    console.log('💾 Relatório salvo em: security-report.json\n');
    
    // Exit code baseado no score
    if (score < 70) {
      process.exit(1);
    } else if (score < 90) {
      process.exit(2); // Warning
    } else {
      process.exit(0); // Success
    }
  }
}

// Executar verificação
if (require.main === module) {
  const checker = new SecurityChecker();
  checker.runAllChecks().catch(error => {
    console.error('❌ Erro durante verificação de segurança:', error.message);
    process.exit(1);
  });
}

module.exports = SecurityChecker;
