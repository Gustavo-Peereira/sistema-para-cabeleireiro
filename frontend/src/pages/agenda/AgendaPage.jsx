import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI } from '../../api/appointments';
import { blocksAPI } from '../../api/blocks';
import { usersAPI } from '../../api/users';
import { useSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { startOfDay, endOfDay, format, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import AppointmentModal from '../../components/appointments/AppointmentModal';

export default function AgendaPage() {
  const { user, isAdmin } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [appointments, setAppointments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Filtros
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProfessional, setSelectedProfessional] = useState(isAdmin() ? 'all' : user.id);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isAdmin()) {
      loadProfessionals();
    }
    loadAppointments();
  }, [selectedDate, selectedProfessional, statusFilter]);

  const loadProfessionals = async () => {
    try {
      const response = await usersAPI.listProfessionals();
      setProfessionals(response.data.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar profissionais', { variant: 'error' });
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      // Usar parseISO para garantir interpretação correta da data (sem problemas de timezone)
      const selectedDateObj = parseISO(selectedDate);
      const from = startOfDay(selectedDateObj).toISOString();
      const to = endOfDay(selectedDateObj).toISOString();

      const params = {
        from,
        to,
        ...(selectedProfessional !== 'all' && { professionalId: selectedProfessional }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };

      // Carregar agendamentos e bloqueios em paralelo
      const [appointmentsResponse, blocksResponse] = await Promise.all([
        appointmentsAPI.list(params),
        blocksAPI.list({
          from,
          to,
          ...(selectedProfessional !== 'all' && { professionalId: selectedProfessional }),
        }),
      ]);

      setAppointments(appointmentsResponse.data.data || []);
      setBlocks(blocksResponse.data.data || []);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar agendamentos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      enqueueSnackbar('Status atualizado com sucesso', { variant: 'success' });
      loadAppointments();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'Erro ao atualizar status',
        { variant: 'error' }
      );
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setModalOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingAppointment(null);
  };

  const handleModalSuccess = () => {
    loadAppointments();
    enqueueSnackbar('Agendamento salvo com sucesso', { variant: 'success' });
  };

  const handlePreviousDay = () => {
    // Usar parseISO para garantir interpretação correta da data
    const currentDate = parseISO(selectedDate);
    const prevDay = subDays(currentDate, 1);
    setSelectedDate(format(prevDay, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    // Usar parseISO para garantir interpretação correta da data
    const currentDate = parseISO(selectedDate);
    const nextDay = addDays(currentDate, 1);
    setSelectedDate(format(nextDay, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const appointmentsByStatus = {
    all: appointments,
    PENDING: appointments.filter((a) => a.status === 'PENDING'),
    CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED'),
    DONE: appointments.filter((a) => a.status === 'DONE'),
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'PENDING').length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    done: appointments.filter((a) => a.status === 'DONE').length,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {isAdmin() ? 'Agenda Geral' : 'Minha Agenda'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewAppointment}
        >
          Novo Agendamento
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterList color="action" />
          <Typography variant="h6">Filtros</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={1} alignItems="center">
              <Button variant="outlined" size="small" onClick={handlePreviousDay}>
                ← Anterior
              </Button>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" size="small" onClick={handleToday}>
                Hoje
              </Button>
              <Button variant="outlined" size="small" onClick={handleNextDay}>
                Próximo →
              </Button>
            </Box>
          </Grid>

          {isAdmin() && (
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Profissional"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
              >
                <MenuItem value="all">Todos os profissionais</MenuItem>
                {professionals.map((prof) => (
                  <MenuItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Todos os status</MenuItem>
              <MenuItem value="PENDING">Pendentes</MenuItem>
              <MenuItem value="CONFIRMED">Confirmados</MenuItem>
              <MenuItem value="DONE">Concluídos</MenuItem>
              <MenuItem value="NO_SHOW">Faltas</MenuItem>
              <MenuItem value="CANCELED">Cancelados</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Estatísticas */}
        <Box display="flex" gap={3} mt={2} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h6">{stats.total}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Pendentes
            </Typography>
            <Typography variant="h6" color="warning.main">
              {stats.pending}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Confirmados
            </Typography>
            <Typography variant="h6" color="info.main">
              {stats.confirmed}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Concluídos
            </Typography>
            <Typography variant="h6" color="success.main">
              {stats.done}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Bloqueios */}
      {!loading && blocks.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.50' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🚫 Bloqueios do Dia
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {blocks.map((block) => (
            <Box
              key={`block-${block.id}`}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: 'white',
                borderRadius: 1,
                borderLeft: 4,
                borderColor: 'error.main',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={isAdmin() ? 3 : 4}>
                  <Typography variant="body2" fontWeight="medium">
                    {format(new Date(block.startDatetime), 'HH:mm')} - {format(new Date(block.endDatetime), 'HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={isAdmin() ? 5 : 5}>
                  <Typography variant="body2" color="text.secondary">
                    {block.reason || 'Bloqueio sem motivo'}
                  </Typography>
                </Grid>
                {isAdmin() && (
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      {block.professional?.name}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={isAdmin() ? 2 : 3}>
                  <Typography variant="caption" color="error.main" fontWeight="bold">
                    BLOQUEADO
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>
      )}

      {/* Lista de Agendamentos */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 && blocks.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              Nenhum agendamento encontrado para esta data
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleNewAppointment}
              sx={{ mt: 2 }}
            >
              Criar Agendamento
            </Button>
          </Box>
        ) : (
          <Box>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                onEdit={handleEditAppointment}
                showProfessional={isAdmin()}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Modal de Agendamento */}
      <AppointmentModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        appointment={editingAppointment}
        prefilledDate={selectedDate}
      />
    </Box>
  );
}

