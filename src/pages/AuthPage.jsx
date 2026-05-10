import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../providers/AuthProvider.jsx';

export default function AuthPage({ mode = 'login', configMissing = false }) {
  const isRegister = mode === 'register';
  const { user, login, register, hasFirebaseConfig } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  if (user && hasFirebaseConfig) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (isRegister) await register(form.fullName, form.email, form.password);
      else await login(form.email, form.password);
      toast.success(isRegister ? 'Account created' : 'Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 2, sm: 5, lg: 8 }, py: 5 }}>
        <Stack spacing={4} sx={{ maxWidth: 760 }}>
          <Stack spacing={1.5}>
            <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 64 }, lineHeight: 1 }}>
              qiparh
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 620 }}>
              A premium command center for life, career, finances, documents, projects, milestones, and proof of progress.
            </Typography>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {['Net worth clarity', 'Career readiness', 'Milestone momentum'].map((item) => (
              <Paper key={item} sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.72) }}>
                <Typography fontWeight={900}>{item}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>Track the details that compound into better decisions.</Typography>
              </Paper>
            ))}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', px: { xs: 2, sm: 5 }, py: 5 }}>
        <Paper
          component={motion.form}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={submit}
          sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 4 }, borderRadius: 4 }}
        >
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="h4">{isRegister ? 'Create account' : 'Sign in'}</Typography>
              <Typography color="text.secondary">
                {isRegister ? 'Set up your protected personal workspace.' : 'Open your private command center.'}
              </Typography>
            </Box>

            {(configMissing || !hasFirebaseConfig) && (
              <Alert severity="warning">
                Firebase environment variables are missing. Add `VITE_FIREBASE_*` values to enable authentication and data.
              </Alert>
            )}

            {isRegister && (
              <TextField label="Full name" value={form.fullName} required onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            )}
            <TextField label="Email" type="email" value={form.email} required onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <TextField label="Password" type="password" value={form.password} required inputProps={{ minLength: 6 }} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <Button type="submit" variant="contained" size="large" disabled={busy || !hasFirebaseConfig}>
              {isRegister ? 'Create qiparh account' : 'Enter qiparh'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {isRegister ? 'Already have an account?' : 'New to qiparh?'}{' '}
              <Typography component={Link} to={isRegister ? '/login' : '/register'} color="primary" fontWeight={800}>
                {isRegister ? 'Sign in' : 'Register'}
              </Typography>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
