import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientsAPI } from '../../api/clients';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';

const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  birthdate: z.string().optional(),
  notes: z.string().optional(),
});

export default function ClientForm({ client, onSuccess, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {},
  });

  useEffect(() => {
    if (client) {
      reset({
        ...client,
        birthdate: client.birthdate
          ? new Date(client.birthdate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios
      const cleanData = {
        ...data,
        email: data.email || null,
        cpf: data.cpf || null,
        birthdate: data.birthdate || null,
        notes: data.notes || null,
      };

      if (client) {
        await clientsAPI.update(client.id, cleanData);
      } else {
        await clientsAPI.create(cleanData);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert(error.response?.data?.error || 'Erro ao salvar cliente');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Telefone"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            placeholder="(00) 00000-0000"
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="CPF"
            {...register('cpf')}
            error={!!errors.cpf}
            helperText={errors.cpf?.message}
            placeholder="000.000.000-00"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Data de Nascimento"
            type="date"
            {...register('birthdate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Observações"
            {...register('notes')}
            multiline
            rows={3}
            placeholder="Ex: Alérgico a produtos com amônia..."
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



