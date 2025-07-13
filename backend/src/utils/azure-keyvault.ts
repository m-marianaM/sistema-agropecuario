import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { logger, securityLogger } from './logger';

/**
 * Azure Key Vault Service
 * Implementa Azure Security Benchmark controle DP-7 (Encryption at Rest)
 */
export class AzureKeyVaultService {
  private secretClient: SecretClient;
  private initialized: boolean = false;

  constructor() {
    this.initializeKeyVault();
  }

  /**
   * Inicializa conexão com Azure Key Vault
   */
  private initializeKeyVault(): void {
    try {
      const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
      
      if (!keyVaultUrl) {
        logger.warn('Azure Key Vault URL not configured, secrets will use environment variables');
        return;
      }

      // Configurar credenciais Azure
      let credential;
      
      if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
        // Service Principal para CI/CD
        credential = new ClientSecretCredential(
          process.env.AZURE_TENANT_ID,
          process.env.AZURE_CLIENT_ID,
          process.env.AZURE_CLIENT_SECRET
        );
        logger.info('Using Service Principal authentication for Key Vault');
      } else {
        // Managed Identity para produção
        credential = new DefaultAzureCredential();
        logger.info('Using Managed Identity authentication for Key Vault');
      }

      this.secretClient = new SecretClient(keyVaultUrl, credential);
      this.initialized = true;
      
      logger.info('Azure Key Vault initialized successfully');
    } catch (error) {
      securityLogger.error('Failed to initialize Azure Key Vault', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyVaultUrl: process.env.AZURE_KEY_VAULT_URL
      });
    }
  }

  /**
   * Recupera um secret do Key Vault
   */
  async getSecret(secretName: string): Promise<string | null> {
    try {
      if (!this.initialized) {
        // Fallback para variáveis de ambiente
        const envValue = process.env[secretName.toUpperCase().replace(/-/g, '_')];
        if (envValue) {
          logger.debug(`Using environment variable for secret: ${secretName}`);
          return envValue;
        }
        return null;
      }

      const secret = await this.secretClient.getSecret(secretName);
      
      if (secret.value) {
        securityLogger.info('Secret retrieved from Key Vault', {
          secretName,
          version: secret.properties.version,
          timestamp: new Date().toISOString()
        });
        
        return secret.value;
      }

      return null;
    } catch (error) {
      securityLogger.error('Failed to retrieve secret from Key Vault', {
        secretName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Fallback para variáveis de ambiente
      const envValue = process.env[secretName.toUpperCase().replace(/-/g, '_')];
      if (envValue) {
        logger.warn(`Falling back to environment variable for secret: ${secretName}`);
        return envValue;
      }

      return null;
    }
  }

  /**
   * Armazena um secret no Key Vault
   */
  async setSecret(secretName: string, secretValue: string, options?: {
    contentType?: string;
    tags?: Record<string, string>;
    enabled?: boolean;
    notBefore?: Date;
    expiresOn?: Date;
  }): Promise<boolean> {
    try {
      if (!this.initialized) {
        throw new Error('Key Vault not initialized');
      }

      await this.secretClient.setSecret(secretName, secretValue, {
        contentType: options?.contentType || 'text/plain',
        tags: {
          ...options?.tags,
          createdBy: 'sistema-agropecuario',
          createdAt: new Date().toISOString()
        },
        enabled: options?.enabled ?? true,
        notBefore: options?.notBefore,
        expiresOn: options?.expiresOn
      });

      securityLogger.info('Secret stored in Key Vault', {
        secretName,
        contentType: options?.contentType,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      securityLogger.error('Failed to store secret in Key Vault', {
        secretName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }

  /**
   * Lista todos os secrets (apenas nomes)
   */
  async listSecrets(): Promise<string[]> {
    try {
      if (!this.initialized) {
        return [];
      }

      const secrets: string[] = [];
      
      for await (const secretProperties of this.secretClient.listPropertiesOfSecrets()) {
        if (secretProperties.enabled && secretProperties.name) {
          secrets.push(secretProperties.name);
        }
      }

      return secrets;
    } catch (error) {
      securityLogger.error('Failed to list secrets from Key Vault', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return [];
    }
  }

  /**
   * Deleta um secret do Key Vault
   */
  async deleteSecret(secretName: string): Promise<boolean> {
    try {
      if (!this.initialized) {
        throw new Error('Key Vault not initialized');
      }

      await this.secretClient.beginDeleteSecret(secretName);

      securityLogger.warn('Secret deleted from Key Vault', {
        secretName,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      securityLogger.error('Failed to delete secret from Key Vault', {
        secretName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }

  /**
   * Recupera múltiplos secrets de uma vez
   */
  async getSecrets(secretNames: string[]): Promise<Record<string, string | null>> {
    const secrets: Record<string, string | null> = {};

    await Promise.all(
      secretNames.map(async (secretName) => {
        secrets[secretName] = await this.getSecret(secretName);
      })
    );

    return secrets;
  }

  /**
   * Rota secrets usando Key Vault
   */
  async rotateSecret(secretName: string, newValue: string): Promise<boolean> {
    try {
      // Criar nova versão do secret
      const success = await this.setSecret(secretName, newValue, {
        tags: {
          rotated: 'true',
          rotatedAt: new Date().toISOString()
        }
      });

      if (success) {
        securityLogger.info('Secret rotated successfully', {
          secretName,
          timestamp: new Date().toISOString()
        });
      }

      return success;
    } catch (error) {
      securityLogger.error('Failed to rotate secret', {
        secretName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const keyVaultService = new AzureKeyVaultService();

/**
 * Helper para configuração de secrets da aplicação
 */
export class AppSecrets {
  private static cache: Record<string, string> = {};
  private static cacheExpiry: Record<string, number> = {};
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Recupera secret com cache
   */
  static async get(secretName: string, useCache: boolean = true): Promise<string | null> {
    const cacheKey = secretName;
    
    // Verificar cache
    if (useCache && this.cache[cacheKey] && this.cacheExpiry[cacheKey] > Date.now()) {
      return this.cache[cacheKey];
    }

    // Recuperar do Key Vault
    const value = await keyVaultService.getSecret(secretName);
    
    if (value && useCache) {
      this.cache[cacheKey] = value;
      this.cacheExpiry[cacheKey] = Date.now() + this.CACHE_DURATION;
    }

    return value;
  }

  /**
   * Recupera secrets críticos da aplicação
   */
  static async getAppSecrets(): Promise<{
    jwtSecret: string;
    jwtRefreshSecret: string;
    dbPassword: string;
    smtpPassword: string;
  }> {
    const [jwtSecret, jwtRefreshSecret, dbPassword, smtpPassword] = await Promise.all([
      this.get('jwt-secret') || process.env.JWT_SECRET!,
      this.get('jwt-refresh-secret') || process.env.JWT_REFRESH_SECRET!,
      this.get('database-password') || process.env.DB_PASSWORD!,
      this.get('smtp-password') || process.env.SMTP_PASS!,
    ]);

    // Validar que todos os secrets foram recuperados
    if (!jwtSecret || !jwtRefreshSecret || !dbPassword) {
      throw new Error('Secrets críticos não encontrados');
    }

    return {
      jwtSecret,
      jwtRefreshSecret,
      dbPassword,
      smtpPassword,
    };
  }

  /**
   * Limpa cache de secrets
   */
  static clearCache(): void {
    this.cache = {};
    this.cacheExpiry = {};
    logger.info('Secrets cache cleared');
  }

  /**
   * Valida configuração de secrets
   */
  static async validateSecretsConfiguration(): Promise<boolean> {
    try {
      const requiredSecrets = [
        'jwt-secret',
        'jwt-refresh-secret',
        'database-password'
      ];

      const results = await Promise.all(
        requiredSecrets.map(async (secret) => ({
          secret,
          exists: (await keyVaultService.getSecret(secret)) !== null
        }))
      );

      const missingSecrets = results.filter(r => !r.exists).map(r => r.secret);
      
      if (missingSecrets.length > 0) {
        securityLogger.error('Missing required secrets', {
          missingSecrets,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      logger.info('All required secrets are configured');
      return true;
    } catch (error) {
      securityLogger.error('Failed to validate secrets configuration', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

export default {
  AzureKeyVaultService,
  keyVaultService,
  AppSecrets
};
