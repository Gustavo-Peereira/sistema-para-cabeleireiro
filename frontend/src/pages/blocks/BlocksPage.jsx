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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { blocksAPI } from '../../api/blocks';
import { usersAPI } from '../../api/users';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { formatDateTime } from '../../utils/dateHelpers';

// Schema base para bloqueio
const baseBlockSchema = z.object({
  startDatetime: z.string().min(1, 'Data/hora inicial é obrigatória'),
  endDatetime: z.string().min(1, 'Data/hora final é obrigatória'),
  reason: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDatetime);
  const end = new Date(data.endDatetime);
  return end > start;
}, {
  message: 'Data/hora final deve ser posterior à inicial',
  path: ['endDatetime'],
});

// Schema para ADMIN (professionalId obrigatório)
const adminBlockSchema = z.object({
  professionalId: z.coerce.number().int().positive('Profissional é obrigatório'),
  startDatetime: z.string().min(1, 'Data/hora inicial é obrigatória'),
  endDatetime: z.string().min(1, 'Data/hora final é obrigatória'),
  reason: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDatetime);
  const end = new Date(data.endDatetime);
  return end > start;
}, {
  message: 'Data/hora final deve ser posterior à inicial',
  path: ['endDatetime'],
});

// Schema para PROFESSIONAL (sem professionalId)
const professionalBlockSchema = baseBlockSchema;

export default function BlocksPage() {
  const [blocks, setBlocks] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Filtros
  const [dateFrom, setDateFrom] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')
  );
  const [dateTo, setDateTo] = useState(
    format(endOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')
  );
  const [selectedProfessional, setSelectedProfessional] = useState('all');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isAdmin() ? adminBlockSchema : professionalBlockSchema),
    defaultValues: {
      professionalId: '',
      startDatetime: '',
      endDatetime: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (isAdmin()) {
      loadProfessionals();
    }
    loadBlocks();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await usersAPI.listProfessionals();
      setProfessionals(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
    }
  };

  const loadBlocks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        from: new Date(dateFrom).toISOString(),
        to: new Date(dateTo + 'T23:59:59').toISOString(),
      };

      // ADMIN pode filtrar por profissional
      if (isAdmin() && selectedProfessional !== 'all') {
        params.professionalId = selectedProfessional;
      }

      const response = await blocksAPI.list(params);
      setBlocks(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar bloqueios:', err);
      setError('Erro ao carregar bloqueios');
      enqueueSnackbar('Erro ao carregar bloqueios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    reset({
      professionalId: isAdmin() ? '' : user.id,
      startDatetime: '',
      endDatetime: '',
      reason: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        startDatetime: new Date(data.startDatetime).toISOString(),
        endDatetime: new Date(data.endDatetime).toISOString(),
        reason: data.reason || null,
      };

      // ADMIN pode especificar profissional, PROFESSIONAL usa próprio ID
      if (isAdmin() && data.professionalId) {
        payload.professionalId = parseInt(data.professionalId);
      }

      await blocksAPI.create(payload);
      enqueueSnackbar('Bloqueio criado com sucesso', { variant: 'success' });
      handleCloseModal();
      loadBlocks();
    } catch (err) {
      console.error('Erro ao criar bloqueio:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao criar bloqueio',
        { variant: 'error' }
      );
    }
  };

  const handleDelete = async (block) => {
    if (!window.confirm(`Deseja realmente excluir este bloqueio?`)) {
      return;
    }

    try {
      await blocksAPI.delete(block.id);
      enqueueSnackbar('Bloqueio removido com sucesso', { variant: 'success' });
      loadBlocks();
    } catch (err) {
      console.error('Erro ao remover bloqueio:', err);
      enqueueSnackbar(
        err.response?.data?.error || 'Erro ao remover bloqueio',
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Bloqueios de Agenda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie períodos indisponíveis para agendamentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Novo Bloqueio
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="De"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Até"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {isAdmin() && (
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Profissional"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {professionals.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12} sm={isAdmin() ? 2 : 6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={loadBlocks}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Início</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Motivo</TableCell>
              {isAdmin() && <TableCell>Profissional</TableCell>}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin() ? 5 : 4} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    Nenhum bloqueio no período selecionado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow key={block.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(block.startDatetime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(block.endDatetime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {block.reason || '-'}
                    </Typography>
                  </TableCell>
                  {isAdmin() && (
                    <TableCell>
                      <Typography variant="body2">
                        {block.professional?.name}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(block)}
                      color="error"
                      title="Excluir"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Criação */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Novo Bloqueio</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {isAdmin() && (
                <Grid item xs={12}>
                  <Controller
                    name="professionalId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Profissional *"
                        error={!!errors.professionalId}
                        helperText={errors.professionalId?.message}
                      >
                        <MenuItem value="">Selecione...</MenuItem>
                        {professionals.map((prof) => (
                          <MenuItem key={prof.id} value={prof.id}>
                            {prof.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <Controller
                  name="startDatetime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Data/Hora Início *"
                      type="datetime-local"
                      error={!!errors.startDatetime}
                      helperText={errors.startDatetime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="endDatetime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Data/Hora Fim *"
                      type="datetime-local"
                      error={!!errors.endDatetime}
                      helperText={errors.endDatetime?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Motivo"
                      multiline
                      rows={2}
                      placeholder="Ex: Almoço, Reunião, Folga..."
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
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
              {isSubmitting ? 'Criando...' : 'Criar Bloqueio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

