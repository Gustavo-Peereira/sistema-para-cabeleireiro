import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../api/clients';
import { useSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Phone,
  Email,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import ClientForm from '../../components/forms/ClientForm';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.list({ active: true });
      setClients(response.data.data);
    } catch (error) {
      enqueueSnackbar('Erro ao carregar clientes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadClients();
  };

  const handleNew = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingClient(null);
  };

  const handleFormSuccess = () => {
    loadClients();
    handleFormClose();
    enqueueSnackbar(
      editingClient ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso',
      { variant: 'success' }
    );
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await clientsAPI.delete(clientToDelete.id);
      enqueueSnackbar('Cliente desativado com sucesso', { variant: 'success' });
      loadClients();
    } catch (error) {
      enqueueSnackbar('Erro ao desativar cliente', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleViewDetails = (client) => {
    navigate(`/clientes/${client.id}`);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.includes(search) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  );

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
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNew}
        >
          Novo Cliente
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Cadastro</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum cliente encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body1">{client.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Phone fontSize="small" color="action" />
                      {client.phone}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {client.email ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Email fontSize="small" color="action" />
                        {client.email}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{client.cpf || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(client.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(client)}
                      title="Ver detalhes"
                    >
                      <Info />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(client)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(client)}
                      title="Desativar"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Formulário */}
      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          <ClientForm
            client={editingClient}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Desativar Cliente</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja desativar o cliente{' '}
            <strong>{clientToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            O cliente não será excluído permanentemente, apenas desativado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Desativar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



