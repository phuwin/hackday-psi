import { createTheme } from '@material-ui/core/styles';

export const theme = createTheme({
  palette: {
    type: 'dark',
  },
  typography: {
    fontFamily: [
      'Open Sans',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(', '),
  }
});
