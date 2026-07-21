import { Box, Paper, Typography } from '@mui/material';
import { Construction } from '@mui/icons-material';

export default function PlaceholderPage({ title }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Paper
        sx={{
          mt: 4,
          p: 6,
          textAlign: 'center',
          bgcolor: 'grey.50',
        }}
      >
        <Construction sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Página em Construção
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esta funcionalidade será implementada em breve.
        </Typography>
      </Paper>
    </Box>
  );
}



