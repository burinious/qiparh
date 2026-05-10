import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, alpha, createTheme } from '@mui/material/styles';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('qiparh-theme') || 'dark');

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: { main: '#36a3ff' },
        secondary: { main: '#8f5cff' },
        warning: { main: '#f5c76a' },
        success: { main: '#2bd4a7' },
        background: {
          default: isDark ? '#050816' : '#f5f7fb',
          paper: isDark ? alpha('#11182d', 0.86) : alpha('#ffffff', 0.9),
        },
        text: {
          primary: isDark ? '#f7f9ff' : '#101624',
          secondary: isDark ? '#aab7d4' : '#596579',
        },
      },
      shape: { borderRadius: 14 },
      typography: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: { fontWeight: 800, letterSpacing: 0 },
        h2: { fontWeight: 800, letterSpacing: 0 },
        h3: { fontWeight: 800, letterSpacing: 0 },
        h4: { fontWeight: 800, letterSpacing: 0 },
        h5: { fontWeight: 800, letterSpacing: 0 },
        h6: { fontWeight: 800, letterSpacing: 0 },
        button: { fontWeight: 700, textTransform: 'none' },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              background: isDark
                ? 'radial-gradient(circle at top left, rgba(54,163,255,0.18), transparent 34%), radial-gradient(circle at 76% 10%, rgba(143,92,255,0.16), transparent 28%), #050816'
                : 'radial-gradient(circle at top left, rgba(54,163,255,0.14), transparent 30%), radial-gradient(circle at 80% 0%, rgba(245,199,106,0.14), transparent 26%), #f5f7fb',
              color: isDark ? '#f7f9ff' : '#101624',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${isDark ? alpha('#ffffff', 0.1) : alpha('#1c2942', 0.08)}`,
              backdropFilter: 'blur(18px)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: 10, minHeight: 42 },
          },
        },
        MuiTextField: {
          defaultProps: { size: 'small' },
        },
        MuiSelect: {
          defaultProps: { size: 'small' },
        },
      },
    });
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleMode: () => {
      setMode((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('qiparh-theme', next);
        return next;
      });
    },
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
