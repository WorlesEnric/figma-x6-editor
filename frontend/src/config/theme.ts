export const theme = {
    colors: {
      bg: {
        primary: '#1e1e1e',
        secondary: '#2c2c2c',
        tertiary: '#383838',
        elevated: '#3c3c3c',
        hover: '#4a4a4a',
        active: '#5a5a5a',
      },
      canvas: {
        background: '#1a1a1a',
        grid: '#2a2a2a',
      },
      border: {
        default: '#404040',
        subtle: '#333333',
        focus: '#0d99ff',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
        tertiary: '#808080',
        disabled: '#5c5c5c',
      },
      accent: {
        default: '#0d99ff',
        hover: '#0b85e0',
        muted: 'rgba(13, 153, 255, 0.15)',
      },
      status: {
        success: '#14ae5c',
        warning: '#ffab00',
        error: '#f24822',
      },
      selection: {
        default: '#0d99ff',
        fill: 'rgba(13, 153, 255, 0.1)',
      },
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      '2xl': 32,
    },
    
    radius: {
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
      full: 9999,
    },
    
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 4px 12px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      dropdown: '0 4px 16px rgba(0, 0, 0, 0.5)',
    },
    
    typography: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      fontMono: "'JetBrains Mono', monospace",
      fontSize: {
        xs: 10,
        sm: 11,
        md: 12,
        lg: 13,
        xl: 14,
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
      },
    },
    
    layout: {
      toolbarHeight: 48,
      leftPanelWidth: 240,
      rightPanelWidth: 260,
      minimapWidth: 200,
      minimapHeight: 140,
    },
    
    zIndex: {
      panel: 10,
      toolbar: 20,
      dropdown: 30,
      modal: 40,
      tooltip: 50,
    },
    
    transition: {
      fast: '0.1s ease',
      normal: '0.2s ease',
      slow: '0.3s ease',
    },
  } as const;
  
  // Default node styles
  export const defaultNodeStyle = {
    fill: '#ffffff',
    stroke: '#333333',
    strokeWidth: 2,
  };
  
  // Default edge styles
  export const defaultEdgeStyle = {
    stroke: '#808080',
    strokeWidth: 2,
  };
  
  // Default text styles
  export const defaultTextStyle = {
    fill: '#333333',
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: 400,
  };