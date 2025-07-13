/**
 * Componente Header do Sistema Agropecuário
 * Contém navegação, alternador de tema e informações do usuário
 * Versão com CSS inline
 */

import React from 'react';
import { Sun, Moon, User, Bell, Search, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const { usuario, logout } = useAuth();

  // Sistema de detecção responsiva
  const [screenSize, setScreenSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  React.useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breakpoints responsivos
  const breakpoints = {
    mobile: screenSize.width < 640,
    tablet: screenSize.width >= 640 && screenSize.width < 1024,
    desktop: screenSize.width >= 1024,
    isSmallScreen: screenSize.width < 1024
  };

  const styles = {
    header: {
      backgroundColor: isDark ? '#1f2937' : '#FFFFFF', // Fundo branco para modo claro
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      transition: 'all 0.2s',
      position: 'fixed' as const,
      top: 0,
      left: breakpoints.desktop ? '256px' : '0',
      right: 0,
      zIndex: 20,
      marginLeft: 0,
      paddingLeft: 0
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: breakpoints.mobile ? '8px 12px' : '12px 16px',
      maxWidth: '100%',
      overflow: 'hidden'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: breakpoints.mobile ? '8px' : '16px',
      flex: breakpoints.mobile ? '0 0 auto' : '1',
      minWidth: 0
    },
    toggleButton: {
      display: breakpoints.desktop ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: breakpoints.mobile ? '6px' : '8px',
      borderRadius: '6px',
      color: isDark ? '#d1d5db' : '#D2691E', // Cor laranja original
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      minWidth: breakpoints.mobile ? '36px' : '40px',
      minHeight: breakpoints.mobile ? '36px' : '40px'
    },
    searchContainer: {
      display: window.innerWidth >= 768 ? 'flex' : 'none',
      flex: 1,
      maxWidth: '448px',
      margin: '0 32px',
      position: 'relative' as const
    },
    searchIconContainer: {
      position: 'absolute' as const,
      top: 0,
      bottom: 0,
      left: 0,
      paddingLeft: '12px',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none' as const
    },
    searchInput: {
      display: 'block',
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '12px',
      paddingTop: '8px',
      paddingBottom: '8px',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      borderRadius: '6px',
      backgroundColor: isDark ? '#374151' : 'white',
      color: isDark ? 'white' : '#005F73', // Azul principal para texto
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    iconButton: {
      padding: breakpoints.mobile ? '6px' : '8px',
      color: isDark ? '#d1d5db' : '#D2691E', // Laranja original para ícones
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: breakpoints.mobile ? '32px' : '36px',
      minHeight: breakpoints.mobile ? '32px' : '36px'
    },
    notificationBadge: {
      position: 'absolute' as const,
      top: '-2px',
      right: '-2px',
      width: breakpoints.mobile ? '14px' : '16px',
      height: breakpoints.mobile ? '14px' : '16px',
      backgroundColor: '#E53E3E', // vermelho-alerta
      color: 'white',
      fontSize: breakpoints.mobile ? '9px' : '10px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: breakpoints.mobile ? '4px' : '8px',
      padding: breakpoints.mobile ? '4px 6px' : '6px 8px',
      color: isDark ? '#d1d5db' : '#4F4F4F', // Texto secundário original
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: breakpoints.mobile ? '12px' : '14px',
      maxWidth: breakpoints.mobile ? '120px' : 'none'
    },
    avatar: {
      width: breakpoints.mobile ? '28px' : '32px',
      height: breakpoints.mobile ? '28px' : '32px',
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    userInfo: {
      display: breakpoints.mobile && screenSize.width < 640 ? 'none' : 'block',
      textAlign: 'left' as const,
      minWidth: 0,
      overflow: 'hidden'
    },
    userName: {
      fontSize: breakpoints.mobile ? '12px' : '14px',
      fontWeight: '500',
      color: isDark ? 'white' : '#005F73', // Azul principal
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    userRole: {
      fontSize: breakpoints.mobile ? '10px' : '12px',
      color: isDark ? '#9ca3af' : '#4F4F4F', // Texto secundário
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    mobileSearch: {
      display: window.innerWidth >= 768 ? 'none' : 'block',
      padding: '0 16px 12px 16px',
      position: 'relative' as const
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Toggle da Sidebar */}
        <div style={styles.leftSection}>
          {/* Botão para toggle da sidebar em mobile */}
          <button
            onClick={onToggleSidebar}
            style={styles.toggleButton}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Toggle sidebar"
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Barra de pesquisa central */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIconContainer}>
            <Search style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
          </div>
          <input
            type="text"
            placeholder="Buscar fazendas, cultivos..."
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Controles do usuário */}
        <div style={styles.rightSection}>
          {/* Botão de notificações */}
          <button 
            style={styles.iconButton}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
            {/* Badge de notificação */}
            <span style={styles.notificationBadge}>
              3
            </span>
          </button>

          {/* Alternador de tema */}
          <button
            onClick={toggleTheme}
            style={styles.iconButton}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {isDark ? (
              <Sun style={{ width: '20px', height: '20px' }} />
            ) : (
              <Moon style={{ width: '20px', height: '20px' }} />
            )}
          </button>

          {/* Perfil do usuário */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              style={styles.userButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={styles.avatar}>
                <User style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>
                  {usuario?.nome || 'Usuário'}
                </p>
                <p style={styles.userRole}>
                  {usuario?.cargo || 'Carregando...'}
                </p>
              </div>
            </button>
            
            {/* Botão de logout */}
            <button
              onClick={logout}
              style={styles.iconButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Sair"
            >
              <LogOut style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de pesquisa mobile */}
      <div style={styles.mobileSearch}>
        <div style={{ position: 'relative' }}>
          <div style={styles.searchIconContainer}>
            <Search style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
              e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
