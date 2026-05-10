import { Box, Button, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

export default function PageHeader({ title, subtitle, action, actionLabel = 'Add item' }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }} sx={{ mb: 3 }}>
      <Box sx={{ maxWidth: 840 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.05 }}>{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: 15, md: 17 } }}>{subtitle}</Typography>}
      </Box>
      {action && (
        <Button variant="contained" startIcon={<Add />} onClick={action} sx={{ alignSelf: { sm: 'center' } }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
