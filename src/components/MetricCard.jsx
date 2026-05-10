import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export default function MetricCard({ label, value, hint, icon: Icon, color = 'primary.main' }) {
  const theme = useTheme();
  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 1, fontSize: { xs: 26, md: 31 } }}>{value}</Typography>
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
        {Icon && (
          <Box sx={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 2.5, display: 'grid', placeItems: 'center', color, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <Icon />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
