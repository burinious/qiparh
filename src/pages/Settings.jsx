import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { DarkMode, LightMode, Logout } from '@mui/icons-material';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../providers/AuthProvider.jsx';
import { useThemeMode } from '../providers/ThemeModeProvider.jsx';

export default function Settings() {
  const { logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Manage theme, access, and local preferences for qiparh." />
      <Paper sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, maxWidth: 760 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ sm: 'center' }}>
            <Box>
              <Typography variant="h6">Appearance</Typography>
              <Typography color="text.secondary">Current mode: {mode}</Typography>
            </Box>
            <Button variant="outlined" startIcon={mode === 'dark' ? <LightMode /> : <DarkMode />} onClick={toggleMode}>Toggle theme</Button>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ sm: 'center' }}>
            <Box>
              <Typography variant="h6">Session</Typography>
              <Typography color="text.secondary">Logout clears the local authenticated session.</Typography>
            </Box>
            <Button color="error" variant="contained" startIcon={<Logout />} onClick={logout}>Logout</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
