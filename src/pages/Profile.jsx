import { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../providers/AuthProvider.jsx';
import { upsertUserDoc } from '../lib/firestore.js';

export default function Profile() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ fullName: '', role: '', location: '', bio: '' });

  useEffect(() => {
    setForm({
      fullName: profile?.fullName || user?.displayName || '',
      role: profile?.role || '',
      location: profile?.location || '',
      bio: profile?.bio || '',
    });
  }, [profile, user]);

  const save = async (event) => {
    event.preventDefault();
    await upsertUserDoc(user.uid, { ...form, email: user.email });
    toast.success('Profile saved');
  };

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Keep your personal command center identity up to date." />
      <Paper component="form" onSubmit={save} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, maxWidth: 760 }}>
        <Stack spacing={2}>
          <TextField label="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <TextField label="Email" value={user.email} disabled />
          <TextField label="Role / headline" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          <TextField label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <TextField label="Bio" value={form.bio} multiline minRows={4} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Save profile</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
