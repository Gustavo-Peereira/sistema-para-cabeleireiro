import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../api/users';
import { salonAPI } from '../../api/salon';
import { authAPI } from '../../api/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schemas de validação
const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirme a nova senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const salonSchema = z.object({
  name: z.string().min(1, 'Nome do salão é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, refreshUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Form de perfil
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Form de senha
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Form de salão (ADMIN only)
  const {
    control: salonControl,
    handleSubmit: handleSalonSubmit,
    reset: resetSalon,
    formState: { errors: salonErrors, isSubmitting: salonSubmitting },
  } = useForm({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (isAdmin()) {
      loadSalonData();
    }
    // Já temos os dados do user no context
    resetProfile({
      name: user?.name || '',
      phone: user?.phone || '',
    });
  }, [user, isAdmin]);

  const loadSalonData = async () => {
    try {
      setLoading(true);
      const response = await salonAPI.get();
      const salon = response.data.data;
      resetSalon({
        name: salon.name || '',
        phone: salon.phone || '',
        address: salon.address || '',
      });
    } catch (err) {
      console.error('Erro ao carregar dados do salão:', err);
      enqueueSnackbar('Erro ao carregar dados do salão', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      await usersAPI.updateMe(data);
      enqueueSnackbar('Perfil atualizado com sucesso', { variant: 'success' });
      // Atualizar dados no contexto sem reload da página
      await refreshUser();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao atualizar perfil',
        { variant: 'error' }
      );
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      enqueueSnackbar('Senha alterada com sucesso', { variant: 'success' });
      resetPassword({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao alterar senha',
        { variant: 'error' }
      );
    }
  };

  const onSalonSubmit = async (data) => {
    try {
      await salonAPI.update(data);
      enqueueSnackbar('Dados do salão atualizados com sucesso', { variant: 'success' });
    } catch (err) {
      console.error('Erro ao atualizar salão:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao atualizar dados do salão',
        { variant: 'error' }
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Gerencie suas preferências e configurações do sistema
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Meu Perfil" />
          <Tab label="Segurança" />
          {isAdmin() && <Tab label="Dados do Salão" />}
        </Tabs>

        {/* Aba: Meu Perfil */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações Pessoais
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Atualize suas informações pessoais
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1, maxWidth: 600 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nome *"
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  helperText="O email não pode ser alterado"
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      error={!!profileErrors.phone}
                      helperText={profileErrors.phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={profileSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={profileSubmitting}
                >
                  {profileSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Aba: Segurança */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alterar Senha
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Para sua segurança, digite sua senha atual antes de definir uma nova
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1, maxWidth: 600 }}>
              <Grid item xs={12}>
                <Controller
                  name="oldPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Senha Atual *"
                      error={!!passwordErrors.oldPassword}
                      helperText={passwordErrors.oldPassword?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Nova Senha *"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Confirmar Nova Senha *"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={passwordSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={passwordSubmitting}
                >
                  {passwordSubmitting ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Aba: Dados do Salão (ADMIN only) */}
        {isAdmin() && (
          <TabPanel value={tabValue} index={2}>
            <Box component="form" onSubmit={handleSalonSubmit(onSalonSubmit)} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Salão
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Atualize os dados do seu estabelecimento
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1, maxWidth: 600 }}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={salonControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Nome do Salão *"
                        error={!!salonErrors.name}
                        helperText={salonErrors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="phone"
                    control={salonControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Telefone"
                        placeholder="(00) 0000-0000"
                        error={!!salonErrors.phone}
                        helperText={salonErrors.phone?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={salonControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Endereço"
                        multiline
                        rows={2}
                        error={!!salonErrors.address}
                        helperText={salonErrors.address?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={salonSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={salonSubmitting}
                  >
                    {salonSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
}

