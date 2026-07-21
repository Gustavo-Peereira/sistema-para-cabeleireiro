import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ClientsList from './pages/clients/ClientsList';
import ServicesList from './pages/services/ServicesList';
import AgendaPage from './pages/agenda/AgendaPage';
import ProfessionalsPage from './pages/professionals/ProfessionalsPage';
import SettingsPage from './pages/settings/SettingsPage';
import BlocksPage from './pages/blocks/BlocksPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  // Aguardar carregamento antes de renderizar rotas
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        {/* Rotas para ADMIN */}
        <Route
          path="agenda"
          element={
            <PrivateRoute requireAdmin>
              <AgendaPage />
            </PrivateRoute>
          }
        />
        <Route
          path="profissionais"
          element={
            <PrivateRoute requireAdmin>
              <ProfessionalsPage />
            </PrivateRoute>
          }
        />
        {/* Rotas para PROFESSIONAL */}
        <Route path="minha-agenda" element={<AgendaPage />} />
        <Route path="bloqueios" element={<BlocksPage />} />

        {/* Rotas compartilhadas */}
        <Route path="clientes" element={<ClientsList />} />
        <Route path="servicos" element={<ServicesList />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

