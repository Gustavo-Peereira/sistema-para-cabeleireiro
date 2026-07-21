import { useState, useEffect } from 'react';
import { servicesAPI } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import ServiceForm from '../../components/forms/ServiceForm';

export default function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.list({ active: true });
      setServices(response.data.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar serviços', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingService(null);
  };

  const handleFormSuccess = () => {
    loadServices();
    handleFormClose();
    enqueueSnackbar(
      editingService ? 'Serviço atualizado com sucesso' : 'Serviço criado com sucesso',
      { variant: 'success' }
    );
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await servicesAPI.delete(serviceToDelete.id);
      enqueueSnackbar('Serviço removido com sucesso', { variant: 'success' });
      loadServices();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || 'Erro ao remover serviço',
        { variant: 'error' }
      );
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
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
        <Typography variant="h4">Serviços</Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNew}
          >
            Novo Serviço
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin() && <TableCell align="right">Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin() ? 6 : 5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum serviço cadastrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {service.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {service.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTime fontSize="small" color="action" />
                      {service.duration} min
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AttachMoney fontSize="small" color="action" />
                      R$ {parseFloat(service.price).toFixed(2)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.active ? 'Ativo' : 'Inativo'}
                      color={service.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {isAdmin() && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(service)}
                        title="Editar"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(service)}
                        title="Remover"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Formulário */}
      {isAdmin() && (
        <Dialog
          open={formOpen}
          onClose={handleFormClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogContent>
            <ServiceForm
              service={editingService}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      {isAdmin() && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Remover Serviço</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja remover o serviço{' '}
              <strong>{serviceToDelete?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta ação não poderá ser desfeita se houver agendamentos futuros associados.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Remover
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}



