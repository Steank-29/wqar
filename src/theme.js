import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  direction: 'ltr',
  typography: {
    fontFamily: 'Oswald, sans-serif',
  },
  palette: {
    primary: {
      main: '#8C5A3C',
    },
    secondary: {
      main: '#F9F6F1',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

// Support RTL
theme = responsiveFontSizes(theme);

export default theme;