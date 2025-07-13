import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Foco automático no campo de email
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Formato de email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validação de senha
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Senha é obrigatória');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) validatePassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email ou senha incorretos. Use: admin@systemagro.com | senha: admin123 ou clique em "Login Rápido"');
      }
    } catch (err) {
      setError('Erro de conexão. Verifique se o backend está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);

    try {
      const success = await login(userEmail, userPassword);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Erro no login rápido');
      }
    } catch (err) {
      setError('Erro no login rápido');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
        : '#F2F2F2', // Fundo cinza do sistema
      padding: '16px',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      backgroundImage: isDark 
        ? 'none'
        : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M30 30c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    },
    loginCard: {
      width: '100%',
      maxWidth: '400px',
      background: isDark ? '#1f2937' : 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: isDark 
        ? '0 25px 50px rgba(0, 0, 0, 0.5)'
        : '0 25px 50px rgba(0, 0, 0, 0.15)',
      border: isDark ? '1px solid #374151' : '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      position: 'relative' as const,
      zIndex: 1
    },
    logoContainer: {
      textAlign: 'center' as const,
      marginBottom: '32px'
    },
    logoIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: '#B8860B', // Dourado do sistema (mesmo tom da sidebar)
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: '0 8px 25px rgba(184, 134, 11, 0.3)', // Sombra dourada
      position: 'relative' as const
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal do sistema
      marginBottom: '8px',
      textAlign: 'center' as const
    },
    subtitle: {
      fontSize: '16px',
      color: isDark ? '#9ca3af' : '#4F4F4F', // Texto secundário do sistema
      textAlign: 'center' as const,
      marginBottom: '32px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    },
    inputGroup: {
      position: 'relative' as const
    },
    inputWrapper: {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '14px 16px 14px 44px',
      border: `2px solid ${emailError || passwordError ? '#ef4444' : (isDark ? '#374151' : '#e5e7eb')}`,
      borderRadius: '12px',
      fontSize: '16px',
      background: isDark ? '#111827' : 'white',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal do sistema
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' as const
    },
    inputFocus: {
      borderColor: '#005F73', // Azul principal do sistema
      boxShadow: '0 0 0 3px rgba(0, 95, 115, 0.1)'
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDark ? '#6b7280' : '#B8860B', // Dourado do sistema
      pointerEvents: 'none' as const
    },
    togglePassword: {
      position: 'absolute' as const,
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: isDark ? '#6b7280' : '#B8860B', // Dourado do sistema
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '4px',
      minHeight: '20px'
    },
    submitButton: {
      width: '100%',
      padding: '16px',
      background: isLoading 
        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
        : 'linear-gradient(135deg, #005F73 0%, #004A5C 100%)', // Azul principal do sistema
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transform: isLoading ? 'scale(0.98)' : 'scale(1)',
      boxShadow: isLoading 
        ? 'none'
        : '0 4px 15px rgba(0, 95, 115, 0.4)'
    },
    errorMessage: {
      background: isDark ? '#991b1b' : '#fef2f2',
      color: isDark ? '#fecaca' : '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: isDark ? '1px solid #dc2626' : '1px solid #fecaca',
      marginBottom: '16px'
    },
    quickLogin: {
      marginTop: '24px',
      padding: '20px',
      background: isDark ? '#111827' : 'rgba(249, 250, 251, 0.8)',
      borderRadius: '12px',
      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
    },
    quickLoginTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal do sistema
      marginBottom: '12px',
      textAlign: 'center' as const
    },
    quickLoginOptions: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    quickLoginButton: {
      width: '100%',
      padding: '12px 16px',
      background: isDark ? '#374151' : 'white',
      color: isDark ? '#f9fafb' : '#005F73', // Azul principal do sistema
      border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left' as const
    }
  };

  const quickLoginUsers = [
    { email: 'admin@systemagro.com', password: 'admin123', role: 'Administrador' },
    { email: 'supervisor@systemagro.com', password: 'super123', role: 'Supervisor' },
    { email: 'peao@systemagro.com', password: 'peao123', role: 'Peão' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern} />
      
      <motion.div
        style={styles.loginCard}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <motion.div 
          style={styles.logoContainer}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            style={styles.logoIcon}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ fontSize: '40px' }}>🌾</span>
          </motion.div>
          <h1 style={styles.title}>Agro System</h1>
          <p style={styles.subtitle}>
            Gestão Agropecuária Inteligente
          </p>
        </motion.div>

        {error && (
          <motion.div 
            style={styles.errorMessage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          style={styles.form}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={{ display: 'none' }}>Email</label>
            <div style={styles.inputWrapper}>
              <User style={styles.inputIcon} size={20} />
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                style={styles.input}
                required
                disabled={isLoading}
                aria-label="Digite seu email"
                aria-describedby={emailError ? "email-error" : undefined}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <div id="email-error" style={styles.errorText} role="alert">
                {emailError}
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={{ display: 'none' }}>Senha</label>
            <div style={styles.inputWrapper}>
              <Lock style={styles.inputIcon} size={20} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={handlePasswordChange}
                style={styles.input}
                required
                disabled={isLoading}
                aria-label="Digite sua senha"
                aria-describedby={passwordError ? "password-error" : undefined}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePassword}
                disabled={isLoading}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <div id="password-error" style={styles.errorText} role="alert">
                {passwordError}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            style={styles.submitButton}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            aria-label={isLoading ? "Fazendo login..." : "Fazer login"}
          >
            {isLoading ? (
              <>
                <motion.div 
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Entrar
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          style={styles.quickLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h3 style={styles.quickLoginTitle}>Login Rápido (Demonstração)</h3>
          <div style={styles.quickLoginOptions}>
            {quickLoginUsers.map((user, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickLogin(user.email, user.password)}
                style={styles.quickLoginButton}
                disabled={isLoading}
                whileHover={{ scale: 1.02, backgroundColor: isDark ? '#4b5563' : '#B0E0E6' }} // Azul claro de destaque do sistema
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                aria-label={`Login rápido como ${user.role}`}
              >
                <strong>{user.role}</strong> - {user.email}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;