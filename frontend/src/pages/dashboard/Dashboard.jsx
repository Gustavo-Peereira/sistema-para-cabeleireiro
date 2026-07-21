import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsAPI } from '../../api/appointments';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  AttachMoney,
  People,
  Schedule,
} from '@mui/icons-material';
import { startOfDay, endOfDay, addDays, isToday, isFuture } from 'date-fns';
import { getStatusColor, getStatusLabel, getPaymentMethodLabel } from '../../utils/statusHelpers';
import { formatPrice } from '../../utils/formatters';
import { formatDateTime } from '../../utils/dateHelpers';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadTodayAppointments();
    }
  }, [user]);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      
      // Não carregar se usuário não estiver disponível
      if (!user) {
        return;
      }
      
      const today = new Date();
      // ADMIN: carrega do dia atual até 7 dias à frente
      // PROFESSIONAL: carrega apenas seus agendamentos futuros
      const response = await appointmentsAPI.list({
        from: startOfDay(today).toISOString(),
        to: endOfDay(addDays(today, 7)).toISOString(),
        ...(isAdmin() ? {} : { professionalId: user.id }),
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Filtrar agendamentos do dia de hoje
  const todayAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.startDatetime);
    return isToday(appointmentDate);
  });

  // Filtrar apenas agendamentos futuros (não passados)
  const upcomingAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.startDatetime);
    return isFuture(appointmentDate) && a.status !== 'CANCELED';
  }).sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime));

  // Estatísticas para ADMIN
  const adminStats = {
    todayTotal: todayAppointments.filter((a) => a.status !== 'CANCELED').length,
    todayPaid: todayAppointments
      .filter((a) => a.paid)
      .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0),
    todayRevenue: todayAppointments
      .filter((a) => a.status !== 'CANCELED')
      .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0),
    weekTotal: appointments.filter((a) => a.status !== 'CANCELED').length,
    weekPaid: appointments
      .filter((a) => a.paid)
      .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0),
  };

  // Estatísticas para PROFESSIONAL
  const professionalStats = {
    todayEstimated: todayAppointments
      .filter((a) => a.status !== 'CANCELED')
      .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0),
    upcomingCount: upcomingAppointments.length,
  };

  const stats = isAdmin() ? adminStats : professionalStats;

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
        Olá, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {isAdmin() ? 'Visão geral do salão' : 'Seus próximos atendimentos'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {isAdmin() ? (
          <>
            {/* ADMIN DASHBOARD */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <People color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{stats.todayTotal}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Atendimentos Hoje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AttachMoney color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">
                        {formatPrice(stats.todayPaid)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Faturado Hoje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AttachMoney color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">
                        {formatPrice(stats.todayRevenue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receita Estimada Hoje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Schedule color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{upcomingAppointments.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Próximos (7 dias)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            {/* PROFESSIONAL DASHBOARD */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Schedule color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{stats.upcomingCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Próximos Atendimentos
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AttachMoney color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">
                        {formatPrice(stats.todayEstimated)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Estimado Hoje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <People color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">{todayAppointments.filter((a) => a.status !== 'CANCELED').length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Atendimentos Hoje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {isAdmin() ? 'Próximos Atendimentos (Todos os Profissionais)' : 'Seus Próximos Atendimentos'}
        </Typography>

        {upcomingAppointments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {isAdmin() 
              ? 'Nenhum agendamento futuro nos próximos 7 dias.' 
              : 'Você não tem agendamentos futuros nos próximos 7 dias.'}
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {upcomingAppointments.slice(0, 10).map((appointment) => (
              <Box
                key={appointment.id}
                sx={{
                  p: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(appointment.startDatetime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body1">{appointment.client.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.client.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={isAdmin() ? 2 : 3}>
                    <Typography variant="body2">{appointment.service?.name || 'Serviço não encontrado'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {appointment.service?.duration || 0} min • {formatPrice(appointment.service?.price)}
                    </Typography>
                  </Grid>
                  {isAdmin() && (
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.professional.name}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={2}>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      <Chip
                        label={getStatusLabel(appointment.status)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                      {appointment.paid && (
                        <Chip
                          label={`Pago - ${getPaymentMethodLabel(appointment.paymentMethod)}`}
                          color="success"
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

