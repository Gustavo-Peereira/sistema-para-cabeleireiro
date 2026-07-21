import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { clientsAPI } from '../../api/clients';
import { useSnackbar } from 'notistack';

export default function QuickClientForm({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      enqueueSnackbar('Nome e telefone são obrigatórios', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await clientsAPI.create({
        name: name.trim(),
        phone: phone.trim(),
      });

      enqueueSnackbar('Cliente criado com sucesso', { variant: 'success' });
      
      // A resposta vem no formato: { success: true, message: "...", data: {...} }
      const newClient = response.data.data;
      
      if (onSuccess && newClient) {
        onSuccess(newClient);
      }
      
      handleClose();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      enqueueSnackbar(
        error.response?.data?.error || 'Erro ao criar cliente',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Criar Cliente Rápido</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Preencha os dados básicos. Você poderá completar as informações depois.
            </Typography>
            
            <TextField
              fullWidth
              label="Nome *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              autoFocus
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Telefone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              placeholder="(00) 00000-0000"
            />
          </Box>
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
            {loading ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

