import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
  Typography,
  Autocomplete,
} from '@mui/material';
import { appointmentsAPI } from '../../api/appointments';
import { clientsAPI } from '../../api/clients';
import { servicesAPI } from '../../api/services';
import { usersAPI } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { format, addMinutes } from 'date-fns';
import QuickClientForm from '../clients/QuickClientForm';

const appointmentSchema = z.object({
  clientId: z.coerce.number().int().positive('Cliente é obrigatório'),
  professionalId: z.coerce.number().int().positive('Profissional é obrigatório'),
  serviceId: z.coerce.number().int().positive('Serviço é obrigatório'),
  startDatetime: z.string().min(1, 'Data/hora é obrigatória'),
  endDatetime: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'NO_SHOW', 'CANCELED']).optional(),
  paid: z.boolean().optional().default(false),
  paymentMethod: z.union([z.enum(['PIX', 'CARD', 'CASH']), z.literal('')]).optional(),
}).refine((data) => {
  // Se paid é true, paymentMethod deve estar preenchido (não vazio)
  if (data.paid === true && (!data.paymentMethod || data.paymentMethod === '')) {
    return false;
  }
  return true;
}, {
  message: 'Forma de pagamento é obrigatória quando o pagamento está marcado como pago',
  path: ['paymentMethod'],
});

export default function AppointmentModal({
  open,
  onClose,
  onSuccess,
  appointment = null,
  prefilledDate = null,
  prefilledTime = null,
}) {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [quickClientOpen, setQuickClientOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: appointment?.clientId || undefined,
      professionalId: appointment?.professionalId || (isAdmin() ? undefined : user?.id),
      serviceId: appointment?.serviceId || undefined,
      startDatetime: appointment?.startDatetime
        ? format(new Date(appointment.startDatetime), "yyyy-MM-dd'T'HH:mm")
        : prefilledDate && prefilledTime
        ? `${prefilledDate}T${prefilledTime}`
        : '',
      endDatetime: appointment?.endDatetime
        ? format(new Date(appointment.endDatetime), "yyyy-MM-dd'T'HH:mm")
        : '',
      notes: appointment?.notes || '',
      status: appointment?.status || 'PENDING',
      paid: appointment?.paid || false,
      paymentMethod: appointment?.paymentMethod || '',
    },
  });

  const serviceIdWatch = watch('serviceId');
  const startDatetimeWatch = watch('startDatetime');

  useEffect(() => {
    if (open) {
      loadData();
      // Resetar formulário quando abrir (apenas para novo agendamento)
      if (!appointment) {
        reset({
          clientId: undefined,
          professionalId: isAdmin() ? undefined : user?.id,
          serviceId: undefined,
          startDatetime: prefilledDate && prefilledTime
            ? `${prefilledDate}T${prefilledTime}`
            : '',
          endDatetime: '',
          notes: '',
          status: 'PENDING',
          paid: false,
          paymentMethod: '',
        });
        setSelectedService(null);
      }
    }
  }, [open]);

  // Atualizar end_datetime quando serviço ou start_datetime mudar
  useEffect(() => {
    if (selectedService && startDatetimeWatch) {
      const start = new Date(startDatetimeWatch);
      const end = addMinutes(start, selectedService.duration);
      setValue('endDatetime', format(end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [selectedService, startDatetimeWatch, setValue]);

  useEffect(() => {
    if (serviceIdWatch && services.length > 0) {
      const service = services.find((s) => s.id === serviceIdWatch);
      setSelectedService(service);
    }
  }, [serviceIdWatch, services]);

  const loadData = async () => {
    try {
      const [clientsRes, servicesRes, professionalsRes] = await Promise.all([
        clientsAPI.list({ active: true }),
        servicesAPI.list({ active: true }),
        usersAPI.listProfessionals(),
      ]);

      // As respostas podem vir em formatos diferentes, tratar ambos
      setClients(clientsRes.data.data || clientsRes.data || []);
      setServices(servicesRes.data.data || servicesRes.data || []);
      setProfessionals(professionalsRes.data.data || professionalsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      console.log('Dados do formulário:', data);
      
      // Garantir que professionalId está preenchido para PROFESSIONAL
      if (!isAdmin() && !data.professionalId) {
        data.professionalId = user.id;
      }

      // Validar se todos os campos obrigatórios estão preenchidos
      if (!data.clientId || !data.professionalId || !data.serviceId || !data.startDatetime) {
        alert('Por favor, preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Converter datas para ISO string e limpar paymentMethod se não pago
      const payload = {
        ...data,
        startDatetime: new Date(data.startDatetime).toISOString(),
        ...(data.endDatetime && { endDatetime: new Date(data.endDatetime).toISOString() }),
        // Garantir que paid seja boolean
        paid: data.paid || false,
        // Não enviar paymentMethod se não estiver pago ou se estiver vazio
        paymentMethod: (data.paid && data.paymentMethod && data.paymentMethod !== '') 
          ? data.paymentMethod 
          : null,
      };

      console.log('Payload enviado:', payload);

      if (appointment) {
        await appointmentsAPI.update(appointment.id, payload);
      } else {
        await appointmentsAPI.create(payload);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao salvar agendamento';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedService(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.error('Erros de validação:', errors);
        // Os erros já são exibidos automaticamente nos campos
      })}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Autocomplete
                      options={clients}
                      getOptionLabel={(option) => `${option.name} - ${option.phone}`}
                      value={clients.find((c) => c.id === field.value) || null}
                      onChange={(_, value) => field.onChange(value?.id || undefined)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cliente *"
                          error={!!errors.clientId}
                          helperText={errors.clientId?.message || 'Ou clique em "Novo Cliente" abaixo'}
                          required
                        />
                      )}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.preventDefault();
                        setQuickClientOpen(true);
                      }}
                      sx={{ mt: 1 }}
                    >
                      + Criar Novo Cliente
                    </Button>
                  </Box>
                )}
              />
            </Grid>

            {isAdmin() && (
              <Grid item xs={12}>
                <Controller
                  name="professionalId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Profissional *"
                      error={!!errors.professionalId}
                      helperText={errors.professionalId?.message}
                      required
                      value={field.value || ''}
                    >
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
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Serviço *"
                    error={!!errors.serviceId}
                    helperText={errors.serviceId?.message}
                    required
                    value={field.value || ''}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - {service.duration} min - R${' '}
                        {parseFloat(service.price).toFixed(2)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="startDatetime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="datetime-local"
                    fullWidth
                    label="Data/Hora Início *"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDatetime}
                    helperText={errors.startDatetime?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="endDatetime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="datetime-local"
                    fullWidth
                    label="Data/Hora Fim"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDatetime}
                    helperText={
                      errors.endDatetime?.message ||
                      (selectedService
                        ? `Calculado automaticamente (${selectedService.duration} min)`
                        : '')
                    }
                  />
                )}
              />
            </Grid>

            {selectedService && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'info.lighter',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main',
                  }}
                >
                  <Typography variant="body2" color="info.dark">
                    <strong>Duração:</strong> {selectedService.duration} minutos •{' '}
                    <strong>Preço:</strong> R$ {parseFloat(selectedService.price).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label="Observações"
                    placeholder="Ex: Cliente prefere corte curto..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="paid"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Pagamento"
                    value={field.value ? 'true' : 'false'}
                    onChange={(e) => {
                      const isPaid = e.target.value === 'true';
                      field.onChange(isPaid);
                      // Limpar paymentMethod quando marcado como não pago
                      if (!isPaid) {
                        setValue('paymentMethod', '');
                      }
                    }}
                  >
                    <MenuItem value="false">Não Pago</MenuItem>
                    <MenuItem value="true">Pago</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="paymentMethod"
                control={control}
                rules={{
                  validate: (value) => {
                    const isPaid = watch('paid');
                    // Só validar se estiver marcado como pago
                    if (isPaid && (!value || value === '')) {
                      return 'Forma de pagamento é obrigatória quando o pagamento está marcado como pago';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Forma de Pagamento"
                    disabled={!watch('paid')}
                    value={field.value || ''}
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message || (watch('paid') ? 'Selecione a forma de pagamento' : '')}
                    required={watch('paid')}
                  >
                    <MenuItem value="">Selecione...</MenuItem>
                    <MenuItem value="PIX">PIX</MenuItem>
                    <MenuItem value="CARD">Cartão</MenuItem>
                    <MenuItem value="CASH">Dinheiro</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {appointment && (
              <Grid item xs={12}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Status">
                      <MenuItem value="PENDING">Pendente</MenuItem>
                      <MenuItem value="CONFIRMED">Confirmado</MenuItem>
                      <MenuItem value="DONE">Concluído</MenuItem>
                      <MenuItem value="NO_SHOW">Não Compareceu</MenuItem>
                      <MenuItem value="CANCELED">Cancelado</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>

      {/* Modal de Cliente Rápido */}
      <QuickClientForm
        open={quickClientOpen}
        onClose={() => setQuickClientOpen(false)}
        onSuccess={(newClient) => {
          // Adicionar novo cliente à lista
          setClients((prev) => [...prev, newClient]);
          // Selecionar automaticamente o cliente recém-criado
          setValue('clientId', newClient.id);
        }}
      />
    </Dialog>
  );
}

