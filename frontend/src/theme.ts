import { createTheme } from '@mui/material/styles';

// Create a custom theme for MUI
const theme = createTheme({
  palette: {
    primary: {
      light: '#d9e2ff',
      main: '#4a5af9',
      dark: '#3a41e0',
      contrastText: '#fff',
    },
    success: {
      light: '#c4eedb',
      main: '#32b281',
      dark: '#288c66',
      contrastText: '#fff',
    },
    warning: {
      light: '#ffeabf',
      main: '#e69c00',
      dark: '#b37800',
      contrastText: '#fff',
    },
    error: {
      light: '#f7c2c2',
      main: '#c23535',
      dark: '#982828',
      contrastText: '#fff',
    },
    // You can customize more colors like background, text, etc.
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif', // Customize fonts here
  },
  components: {
    // Customize components here (for example, Button)
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.3s ease-in-out',
        },
        containedPrimary: {
          backgroundColor: '#4a5af9',
          '&:hover': {
            backgroundColor: '#3a41e0',
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Export the theme to be used in the app
export default theme;