import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { servicesAPI } from '../../api/services';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  InputAdornment,
} from '@mui/material';

const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, 'Duração deve ser maior que 0'),
  price: z.coerce.number().min(0, 'Preço não pode ser negativo'),
});

export default function ServiceForm({ service, onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || { duration: 30, price: 0 },
  });

  useEffect(() => {
    if (service) {
      reset(service);
    }
  }, [service, reset]);

  const onSubmit = async (data) => {
    try {
      if (service) {
        await servicesAPI.update(service.id, data);
      } else {
        await servicesAPI.create(data);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert(error.response?.data?.error || 'Erro ao salvar serviço');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome do Serviço"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            required
            placeholder="Ex: Corte Feminino"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            rows={2}
            placeholder="Descrição opcional do serviço"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Duração"
            type="number"
            {...register('duration')}
            error={!!errors.duration}
            helperText={errors.duration?.message}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">minutos</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Preço"
            type="number"
            {...register('price')}
            error={!!errors.price}
            helperText={errors.price?.message}
            required
            inputProps={{ step: '0.01', min: '0' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={20} />}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </Box>
    </Box>
  );
}



