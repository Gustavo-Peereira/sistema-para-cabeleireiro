import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usersAPI } from '../../api/users';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  active: z.boolean().default(true),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  active: z.boolean().default(true),
});

export default function ProfessionalsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      active: true,
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.list();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        active: user.active,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        active: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      // Remover password se estiver vazio na edição
      if (editingUser && !data.password) {
        delete data.password;
      }

      // Forçar role como PROFESSIONAL na criação (ADMIN não pode criar outros ADMINs via UI)
      const payload = editingUser ? data : { ...data, role: 'PROFESSIONAL' };

      if (editingUser) {
        await usersAPI.update(editingUser.id, payload);
        enqueueSnackbar('Profissional atualizado com sucesso', { variant: 'success' });
      } else {
        await usersAPI.create(payload);
        enqueueSnackbar('Profissional criado com sucesso', { variant: 'success' });
      }

      handleCloseModal();
      loadUsers();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao salvar profissional',
        { variant: 'error' }
      );
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersAPI.toggleActive(user.id, !user.active);
      enqueueSnackbar(
        `Profissional ${!user.active ? 'ativado' : 'desativado'} com sucesso`,
        { variant: 'success' }
      );
      loadUsers();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      enqueueSnackbar('Erro ao alterar status do profissional', { variant: 'error' });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Profissionais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os profissionais do seu salão
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Profissional
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Perfil</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    Nenhum profissional cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.phone || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'ADMIN' ? 'Administrador' : 'Profissional'}
                      color={user.role === 'ADMIN' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? 'Ativo' : 'Inativo'}
                      color={user.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(user)}
                      title="Editar"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(user)}
                      title={user.active ? 'Desativar' : 'Ativar'}
                      color={user.active ? 'error' : 'success'}
                    >
                      {user.active ? (
                        <PersonOffIcon fontSize="small" />
                      ) : (
                        <PersonAddIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Criação/Edição */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingUser ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nome *"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      autoFocus
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email *"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                      type="password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Ativo"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Salvando...' : editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

