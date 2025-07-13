/**
 * Componente Sidebar responsivo do Sistema Agropecuário
 * Navegação lateral com CSS inline e React Router
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sprout, 
  Beaker, 
  ShoppingCart, 
  Package, 
  UserCheck, 
  FileSpreadsheet,
  BarChart3,
  Settings,
  ChevronLeft,
  MapPin
} from 'lucide-react';

// Componente de emoji de vaca com cores originais
const CowIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <span 
    style={{ 
      fontSize: size,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'inline-block',
      lineHeight: 1
    }}
  >
    🐄
  </span>
);

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
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

  // Tamanho dos ícones baseado no tamanho da tela
  const iconSize = screenSize.width < 640 ? '22px' : '20px';

  // Itens de navegação do sistema
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home style={{ width: iconSize, height: iconSize }} />,
      href: '/'
    },
    {
      id: 'fazendas',
      label: 'Fazendas',
      icon: <MapPin style={{ width: iconSize, height: iconSize }} />,
      href: '/fazendas'
    },
    {
      id: 'cultivos',
      label: 'Cultivos',
      icon: <Sprout style={{ width: iconSize, height: iconSize }} />,
      href: '/cultivos',
      badge: 3
    },
    {
      id: 'producao-racao',
      label: 'Produção de Ração',
      icon: <CowIcon size={parseInt(iconSize)} color="currentColor" />,
      href: '/producao-racao'
    },
    {
      id: 'adubagem',
      label: 'Adubagem',
      icon: <Beaker style={{ width: iconSize, height: iconSize }} />,
      href: '/adubagem'
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: <ShoppingCart style={{ width: iconSize, height: iconSize }} />,
      href: '/vendas'
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: <Package style={{ width: iconSize, height: iconSize }} />,
      href: '/estoque'
    },
    {
      id: 'produtor',
      label: 'Painel do Produtor',
      icon: <UserCheck style={{ width: iconSize, height: iconSize }} />,
      href: '/produtor'
    }
  ];

  // Itens de ferramentas e configurações
  const toolItems: NavItem[] = [
    {
      id: 'import',
      label: 'Importar Excel',
      icon: <FileSpreadsheet style={{ width: iconSize, height: iconSize }} />,
      href: '/import'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: <BarChart3 style={{ width: iconSize, height: iconSize }} />,
      href: '/reports'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings style={{ width: iconSize, height: iconSize }} />,
      href: '/settings'
    }
  ];

  const currentPath = location.pathname;

  // Breakpoints responsivos
  const breakpoints = {
    mobile: screenSize.width < 640,
    tablet: screenSize.width >= 640 && screenSize.width < 1024,
    desktop: screenSize.width >= 1024,
    isSmallScreen: screenSize.width < 1024
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 20,
      display: (breakpoints.isSmallScreen && isOpen) ? 'block' : 'none',
      backdropFilter: 'blur(2px)'
    },
    sidebar: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      bottom: 0,
      width: breakpoints.mobile ? '280px' : '256px',
      maxWidth: breakpoints.mobile ? '85vw' : '256px',
      height: '100vh',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      transform: breakpoints.desktop ? 'translateX(0)' : 
                 (isOpen ? 'translateX(0)' : 'translateX(-100%)'),
      transition: 'transform 0.3s ease-in-out',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: breakpoints.isSmallScreen ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none',
      margin: 0,
      padding: 0
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: breakpoints.mobile ? '16px 16px 12px 16px' : '20px 16px 16px 16px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      minHeight: breakpoints.mobile ? '60px' : '64px',
      margin: 0
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: breakpoints.mobile ? '6px' : '8px'
    },
    logoIcon: {
      width: breakpoints.mobile ? '28px' : '32px',
      height: breakpoints.mobile ? '28px' : '32px',
      backgroundColor: '#B8860B', // Dourado do sistema (mesmo tom dos ícones)
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: breakpoints.mobile ? '12px' : '14px'
    },
    logoText: {
      fontWeight: '600',
      color: '#005F73', // Azul principal
      fontSize: breakpoints.mobile ? '14px' : '16px',
      display: breakpoints.mobile && screenSize.width < 320 ? 'none' : 'block'
    },
    logoTextContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start'
    },
    logoSubtitle: {
      fontWeight: '400',
      color: '#4F4F4F', // Texto secundário
      fontSize: breakpoints.mobile ? '10px' : '12px',
      display: breakpoints.mobile && screenSize.width < 320 ? 'none' : 'block',
      marginTop: '2px'
    },
    closeButton: {
      padding: '8px',
      borderRadius: '6px',
      color: '#4F4F4F', // Texto secundário
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    nav: {
      flex: 1,
      padding: breakpoints.mobile ? '12px' : '16px',
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const
    },
    navSection: {
      marginBottom: breakpoints.mobile ? '12px' : '16px'
    },
    navTitle: {
      padding: '0 12px',
      fontSize: breakpoints.mobile ? '10px' : '12px',
      fontWeight: '600',
      color: '#4F4F4F', // Texto secundário
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: '8px'
    },
    separator: {
      borderTop: '1px solid #e5e7eb',
      margin: breakpoints.mobile ? '12px 0' : '16px 0'
    },
    footer: {
      padding: breakpoints.mobile ? '12px 16px' : '16px',
      borderTop: '1px solid #e5e7eb'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: breakpoints.mobile ? '8px' : '12px'
    },
    avatar: {
      width: breakpoints.mobile ? '28px' : '32px',
      height: breakpoints.mobile ? '28px' : '32px',
      backgroundColor: '#d1d5db',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: breakpoints.mobile ? '11px' : '14px',
      fontWeight: '500',
      color: '#374151'
    },
    userDetails: {
      flex: 1,
      minWidth: 0,
      display: breakpoints.mobile && screenSize.width < 280 ? 'none' : 'block'
    },
    userName: {
      fontSize: breakpoints.mobile ? '12px' : '14px',
      fontWeight: '500',
      color: '#005F73', // Azul principal
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      margin: 0
    },
    userRole: {
      fontSize: breakpoints.mobile ? '10px' : '12px',
      color: '#4F4F4F', // Texto secundário
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      margin: 0
    }
  };

  const isDesktop = window.innerWidth >= 1024;

  return (
    <>
      {/* Overlay para mobile */}
      {!isDesktop && isOpen && (
        <div 
          style={styles.overlay}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Header da sidebar */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <span style={{ color: 'white', fontWeight: 'bold' }}>🌾</span>
            </div>
            <div style={styles.logoTextContainer}>
              <span style={styles.logoText}>
                Agro System
              </span>
              <span style={styles.logoSubtitle}>
                Gestão Agropecuária
              </span>
            </div>
          </div>
          
          {/* Botão para colapsar sidebar - só aparece em mobile */}
          {!isDesktop && (
            <button
              onClick={onToggle}
              style={styles.closeButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>

        {/* Navegação principal */}
        <nav style={styles.nav}>
          {/* Seção principal */}
          <div style={styles.navSection}>
            <h3 style={styles.navTitle}>
              Navegação
            </h3>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={currentPath === item.href}
              />
            ))}
          </div>

          {/* Separador */}
          <div style={styles.separator} />

          {/* Seção de ferramentas */}
          <div style={styles.navSection}>
            <h3 style={styles.navTitle}>
              Ferramentas
            </h3>
            {toolItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isActive={currentPath === item.href}
              />
            ))}
          </div>
        </nav>

        {/* Footer da sidebar */}
        <div style={styles.footer}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              <span>JP</span>
            </div>
            <div style={styles.userDetails}>
              <p style={styles.userName}>
                João Produtor
              </p>
              <p style={styles.userRole}>
                Fazenda São João
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Componente para cada item de navegação
interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ item, isActive }) => {
  // Usar as mesmas variáveis de breakpoint do componente pai
  const screenSize = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const breakpoints = {
    mobile: screenSize.width < 640,
    tablet: screenSize.width >= 640 && screenSize.width < 1024,
    desktop: screenSize.width >= 1024,
    isSmallScreen: screenSize.width < 1024
  };

  const linkStyles = {
    base: {
      display: 'flex',
      alignItems: 'center',
      padding: breakpoints.mobile ? '10px 12px' : '8px 12px',
      fontSize: breakpoints.mobile ? '15px' : '14px',
      fontWeight: '500',
      borderRadius: '6px',
      textDecoration: 'none',
      transition: 'all 0.15s ease-in-out',
      marginBottom: '2px',
      cursor: 'pointer',
      minHeight: breakpoints.mobile ? '44px' : 'auto', // Área de toque maior em mobile
      justifyContent: breakpoints.mobile && screenSize.width < 320 ? 'center' : 'flex-start'
    },
    active: {
      backgroundColor: '#B0E0E6', // Azul claro de destaque - Item ativo (menu)
      color: '#005F73' // Azul principal - Texto de item ativo
    },
    inactive: {
      backgroundColor: 'transparent',
      color: '#005F73' // Azul principal - Texto principal
    },
    hover: {
      backgroundColor: '#f3f4f6',
      color: '#005F73' // Azul principal
    }
  };

  const iconStyles = {
    marginRight: breakpoints.mobile && screenSize.width < 320 ? '0' : (breakpoints.mobile ? '10px' : '12px'),
    color: isActive ? '#B8860B' : '#B8860B', // Dourado para ícones (sempre dourado)
    flexShrink: 0,
    width: breakpoints.mobile ? '22px' : '20px',
    height: breakpoints.mobile ? '22px' : '20px'
  };

  const labelStyles = {
    flex: 1,
    display: breakpoints.mobile && screenSize.width < 320 ? 'none' : 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  };

  const badgeStyles = {
    marginLeft: breakpoints.mobile ? '6px' : '8px',
    display: breakpoints.mobile && screenSize.width < 320 ? 'none' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    fontSize: breakpoints.mobile ? '10px' : '11px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#E53E3E', // vermelho-alerta - Badges de alerta
    borderRadius: '9999px',
    minWidth: breakpoints.mobile ? '16px' : '18px',
    height: breakpoints.mobile ? '16px' : '18px'
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const currentStyle = {
    ...linkStyles.base,
    ...(isActive ? linkStyles.active : linkStyles.inactive),
    ...(isHovered && !isActive ? linkStyles.hover : {})
  };

  return (
    <Link
      to={item.href}
      style={currentStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={breakpoints.mobile && screenSize.width < 320 ? item.label : undefined} // Tooltip em telas muito pequenas
    >
      <span style={iconStyles}>
        {item.icon}
      </span>
      <span style={labelStyles}>{item.label}</span>
      
      {/* Badge para notificações */}
      {item.badge && (
        <span style={badgeStyles}>
          {item.badge}
        </span>
      )}
    </Link>
  );
};

export default Sidebar;
