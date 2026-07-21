import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  CheckCircle,
  Cancel,
  Done,
  PersonOff,
  Edit,
  Phone,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendente',
    color: 'warning',
    bgColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'info',
    bgColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  DONE: {
    label: 'Concluído',
    color: 'success',
    bgColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  NO_SHOW: {
    label: 'Faltou',
    color: 'error',
    bgColor: '#ffebee',
    borderColor: '#f44336',
  },
  CANCELED: {
    label: 'Cancelado',
    color: 'default',
    bgColor: '#f5f5f5',
    borderColor: '#9e9e9e',
  },
};

export default function AppointmentCard({ appointment, onStatusChange, onEdit, showProfessional = false }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(appointment.id, newStatus);
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(appointment);
    handleMenuClose();
  };

  const startTime = format(new Date(appointment.startDatetime), 'HH:mm', { locale: ptBR });
  const endTime = format(new Date(appointment.endDatetime), 'HH:mm', { locale: ptBR });

  return (
    <Card
      sx={{
        mb: 1,
        borderLeft: 4,
        borderColor: statusConfig.borderColor,
        bgcolor: statusConfig.bgColor,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary">
                {startTime} - {endTime}
              </Typography>
              <Chip
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>

            <Typography variant="body1" fontWeight="medium" gutterBottom>
              {appointment.client.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {appointment.service.name} • {appointment.service.duration} min
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {appointment.client.phone}
              </Typography>
            </Box>

            {showProfessional && (
              <Typography variant="caption" color="primary" fontWeight="medium" display="block" mt={0.5}>
                {appointment.professional.name}
              </Typography>
            )}

            {appointment.notes && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Obs: {appointment.notes}
              </Typography>
            )}
          </Box>

          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>

          {appointment.status === 'PENDING' && (
            <MenuItem onClick={() => handleStatusChange('CONFIRMED')}>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="info" />
              </ListItemIcon>
              <ListItemText>Confirmar</ListItemText>
            </MenuItem>
          )}

          {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
            <>
              <MenuItem onClick={() => handleStatusChange('DONE')}>
                <ListItemIcon>
                  <Done fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Marcar como Concluído</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => handleStatusChange('NO_SHOW')}>
                <ListItemIcon>
                  <PersonOff fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Marcar Falta</ListItemText>
              </MenuItem>
            </>
          )}

          {appointment.status !== 'CANCELED' && appointment.status !== 'DONE' && (
            <MenuItem onClick={() => handleStatusChange('CANCELED')}>
              <ListItemIcon>
                <Cancel fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Cancelar</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </CardContent>
    </Card>
  );
}



