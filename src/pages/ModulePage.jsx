import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, Divider, IconButton, InputAdornment, LinearProgress, MenuItem, Paper, Stack,
  TextField, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Delete, Download, Edit, FilterList, OpenInNew, Search, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader.jsx';
import ItemDialog from '../components/ItemDialog.jsx';
import { useAuth } from '../providers/AuthProvider.jsx';
import { createUserItem, deleteStoredFile, deleteUserItem, subscribeUserCollection, updateUserItem, uploadUserFile } from '../lib/firestore.js';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function primaryTitle(item) {
  return item.title || item.name || item.skillName || item.companyName || item.lender || item.platform || 'Untitled';
}

function progressOf(item, config) {
  if (typeof item.progress === 'number') return Math.max(0, Math.min(100, item.progress));
  if (config.collection === 'loans') {
    const borrowed = Number(item.amountBorrowed || 0);
    if (!borrowed) return 0;
    return Math.min(100, Math.round((Number(item.amountPaid || 0) / borrowed) * 100));
  }
  return null;
}

function moneyValue(item) {
  if (typeof item.amount === 'number') return item.amount;
  if (typeof item.revenuePotential === 'number') return item.revenuePotential;
  if (typeof item.amountBorrowed === 'number') return item.amountBorrowed;
  return null;
}

export default function ModulePage({ moduleKey, config }) {
  const { user } = useAuth();
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const collectionName = config.collection;

  useEffect(() => {
    return subscribeUserCollection(user.uid, collectionName, setItems);
  }, [collectionName, user.uid]);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => !config.preset || Object.entries(config.preset).every(([key, value]) => ['Income', 'Salary', 'Side income'].includes(item[key]) || item[key] === value))
      .filter((item) => {
        const haystack = (config.searchFields || []).map((field) => item[field]).join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .filter((item) => {
        if (filter === 'All' || !config.filters?.[0]) return true;
        return item[config.filters[0].name] === filter;
      });
  }, [config, filter, items, query]);

  const filterOptions = useMemo(() => {
    const field = config.filters?.[0]?.name;
    if (!field) return [];
    return ['All', ...Array.from(new Set(items.map((item) => item[field]).filter(Boolean)))];
  }, [config.filters, items]);

  const moduleStats = useMemo(() => {
    const withProgress = visibleItems.filter((item) => progressOf(item, config) !== null);
    const averageProgress = withProgress.length
      ? Math.round(withProgress.reduce((total, item) => total + progressOf(item, config), 0) / withProgress.length)
      : null;
    const trackedValue = visibleItems.reduce((total, item) => total + Number(moneyValue(item) || 0), 0);
    return [
      { label: 'Records', value: visibleItems.length },
      { label: 'Filtered from', value: items.length },
      averageProgress !== null && { label: 'Avg progress', value: `${averageProgress}%` },
      trackedValue > 0 && { label: 'Tracked value', value: currency.format(trackedValue) },
    ].filter(Boolean).slice(0, 4);
  }, [config, items.length, visibleItems]);

  const saveItem = async (payload, file) => {
    try {
      let nextPayload = payload;
      if (file) {
        const uploaded = await uploadUserFile(user.uid, collectionName, file);
        nextPayload = {
          ...payload,
          fileUrl: uploaded.url,
          filePath: uploaded.path,
          fileName: uploaded.name,
          fileType: uploaded.type,
          fileSize: uploaded.size,
        };
      }
      if (moduleKey === 'documents' && nextPayload.isLatestCv) {
        const cvItems = items.filter((item) => item.category === 'CV' && item.id !== editing?.id);
        await Promise.all(cvItems.map((item) => updateUserItem(user.uid, collectionName, item.id, { isLatestCv: false })));
      }
      if (editing?.id) await updateUserItem(user.uid, collectionName, editing.id, nextPayload);
      else await createUserItem(user.uid, collectionName, nextPayload);
      toast.success(editing?.id ? 'Updated' : 'Created');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete "${primaryTitle(item)}"?`)) return;
    try {
      await deleteUserItem(user.uid, collectionName, item.id);
      await deleteStoredFile(item.filePath);
      toast.success('Deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const Icon = config.icon;

  return (
    <Box>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={() => { setEditing(null); setDialogOpen(true); }}
        actionLabel={`Add ${config.title.replace(' Tracker', '').replace('Document Vault', 'document')}`}
      />

      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.background.paper, 0.86)} 42%)`,
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            placeholder={`Search ${config.title.toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          {filterOptions.length > 0 && (
            <TextField
              select
              label={config.filters[0].label}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              sx={{ minWidth: { md: 220 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><FilterList /></InputAdornment> }}
            >
              {filterOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          )}
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {moduleStats.map((stat) => (
              <Box key={stat.label} sx={{ px: 1.6, py: 1, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.45), minWidth: 104 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>{stat.label}</Typography>
                <Typography fontWeight={950}>{stat.value}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2.5 }}>
        {visibleItems.map((item) => {
          const progress = progressOf(item, config);
          const balance = config.collection === 'loans' ? Number(item.amountBorrowed || 0) + Number(item.interest || 0) - Number(item.amountPaid || 0) : null;
          return (
            <Paper
              key={item.id}
              sx={{
                p: 2.5,
                borderRadius: 3,
                minHeight: 228,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: alpha(theme.palette.primary.main, 0.36),
                  boxShadow: `0 18px 54px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.28 : 0.12)}`,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
                <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2.3, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Icon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={900} noWrap>{primaryTitle(item)}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {item.category || item.status || item.type || item.level || item.role || item.url || 'qiparh record'}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => { setEditing(item); setDialogOpen(true); }}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => removeItem(item)}><Delete fontSize="small" /></IconButton>
                </Stack>
              </Stack>

              <Stack spacing={1.2} sx={{ mt: 2, flex: 1 }}>
                {item.description && <Typography variant="body2" color="text.secondary">{item.description}</Typography>}
                {item.notes && <Typography variant="body2" color="text.secondary">{item.notes}</Typography>}
                {typeof item.amount === 'number' && <Chip label={currency.format(item.amount)} color="primary" sx={{ alignSelf: 'flex-start' }} />}
                {balance !== null && <Chip label={`Balance ${currency.format(balance)}`} color={balance > 0 ? 'warning' : 'success'} sx={{ alignSelf: 'flex-start' }} />}
                {item.deadline && <Chip label={`Deadline ${item.deadline}`} variant="outlined" sx={{ alignSelf: 'flex-start' }} />}
                {item.isLatestCv && <Chip label="Latest CV" color="secondary" sx={{ alignSelf: 'flex-start' }} />}
                {Array.isArray(item.tasks) && item.tasks.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>{item.tasks.slice(0, 4).map((task) => <Chip key={task} size="small" label={task} />)}</Stack>
                )}
                {progress !== null && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption">Progress</Typography><Typography variant="caption">{progress}%</Typography></Stack>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
                  </Box>
                )}
              </Stack>

              <Divider sx={{ mt: 2 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                {item.fileUrl && <Button size="small" variant="outlined" startIcon={<Visibility />} href={item.fileUrl} target="_blank">Preview</Button>}
                {item.fileUrl && <Button size="small" variant="outlined" startIcon={<Download />} href={item.fileUrl} download>Download</Button>}
                {(item.liveLink || item.githubLink || item.url || item.link || item.proofLink) && (
                  <Button size="small" variant="outlined" startIcon={<OpenInNew />} href={item.liveLink || item.githubLink || item.url || item.link || item.proofLink} target="_blank">Open</Button>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {visibleItems.length === 0 && (
        <Paper sx={{ p: { xs: 4, md: 6 }, mt: 2, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}>
          <Box sx={{ width: 62, height: 62, mx: 'auto', mb: 2, borderRadius: 3, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <Icon />
          </Box>
          <Typography variant="h5">No records yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.7, maxWidth: 420, mx: 'auto' }}>
            Add the first item to turn this module into a useful part of your command center.
          </Typography>
          <Button variant="contained" sx={{ mt: 2.5 }} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add first record
          </Button>
        </Paper>
      )}

      <ItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={saveItem}
        fields={config.fields}
        item={editing}
        title={config.title}
        fileEnabled={config.file}
        preset={config.preset || {}}
      />
    </Box>
  );
}
