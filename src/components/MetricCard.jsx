import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export default function MetricCard({ label, value, hint, icon: Icon, color = 'primary.main', progress }) {
  const theme = useTheme();
  const resolvedColor = color.split('.').reduce((current, key) => current?.[key], theme.palette) || color;

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${alpha(resolvedColor, 0.16)}, transparent 42%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 1, fontSize: { xs: 26, md: 31 } }}>{value}</Typography>
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
          {typeof progress === 'number' && (
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, progress))}
              sx={{
                mt: 1.6,
                height: 6,
                borderRadius: 5,
                bgcolor: alpha(resolvedColor, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: resolvedColor },
              }}
            />
          )}
        </Box>
        {Icon && (
          <Box sx={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 2.5, display: 'grid', placeItems: 'center', color, bgcolor: alpha(resolvedColor, 0.12) }}>
            <Icon />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
