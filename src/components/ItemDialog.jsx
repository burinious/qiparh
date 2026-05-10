import { useEffect, useMemo, useState } from 'react';
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material';

function initialState(fields, item, preset = {}) {
  const state = { ...preset };
  fields.forEach((field) => {
    if (field.type === 'tags') state[field.name] = Array.isArray(item?.[field.name]) ? item[field.name].join(', ') : item?.[field.name] || '';
    else state[field.name] = item?.[field.name] ?? preset[field.name] ?? (field.type === 'boolean' ? false : '');
  });
  return state;
}

export default function ItemDialog({ open, onClose, onSubmit, fields, item, title, fileEnabled, preset }) {
  const [form, setForm] = useState(() => initialState(fields, item, preset));
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const isEditing = Boolean(item?.id);
  const dialogTitle = useMemo(() => `${isEditing ? 'Edit' : 'Add'} ${title}`, [isEditing, title]);

  useEffect(() => {
    if (open) {
      setForm(initialState(fields, item, preset));
      setFile(null);
    }
  }, [fields, item, open, preset]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const payload = {};
    fields.forEach((field) => {
      const raw = form[field.name];
      if (field.type === 'number') payload[field.name] = Number(raw || 0);
      else if (field.type === 'boolean') payload[field.name] = Boolean(raw);
      else if (field.type === 'tags') payload[field.name] = String(raw || '').split(',').map((part) => part.trim()).filter(Boolean);
      else payload[field.name] = raw ?? '';
    });
    Object.assign(payload, preset);
    try {
      await onSubmit(payload, file);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="item-form" spacing={2} sx={{ pt: 1 }} onSubmit={handleSubmit}>
          {fields.map((field) => {
            if (field.type === 'boolean') {
              return (
                <FormControlLabel
                  key={field.name}
                  control={<Checkbox checked={Boolean(form[field.name])} onChange={(event) => setForm({ ...form, [field.name]: event.target.checked })} />}
                  label={field.label}
                />
              );
            }
            return (
              <TextField
                key={field.name}
                label={field.label}
                value={form[field.name] ?? ''}
                required={field.required}
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                select={field.type === 'select'}
                multiline={field.type === 'textarea'}
                minRows={field.type === 'textarea' ? 3 : undefined}
                InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                helperText={field.type === 'tags' ? 'Separate multiple values with commas.' : ''}
              >
                {(field.options || []).map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
            );
          })}
          {fileEnabled && (
            <Stack spacing={1}>
              <Button variant="outlined" component="label">
                Upload file
                <input hidden type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </Button>
              <Typography variant="caption" color="text.secondary">{file ? file.name : item?.fileName || 'No file selected'}</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button form="item-form" type="submit" variant="contained" disabled={busy}>{isEditing ? 'Save changes' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  );
}
