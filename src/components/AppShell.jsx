import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Stack, Toolbar, Typography, useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DarkMode, LightMode, Logout, Menu, Shield } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { navItems } from '../data/modules.js';
import { useAuth } from '../providers/AuthProvider.jsx';
import { useThemeMode } from '../providers/ThemeModeProvider.jsx';

const drawerWidth = 292;

function Sidebar({ onNavigate }) {
  const theme = useTheme();
  const { profile, user, logout } = useAuth();
  const { pathname } = useLocation();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1, py: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            color: '#08111f',
            background: 'linear-gradient(135deg, #36a3ff, #8f5cff 54%, #f5c76a)',
          }}
        >
          q
        </Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 900 }}>qiparh</Typography>
          <Typography variant="caption" color="text.secondary">Personal command center</Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{
          p: 1.25,
          my: 1.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.22), color: 'warning.main', fontWeight: 800 }}>
          {(profile?.fullName || user?.email || 'Q').slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap fontWeight={800}>{profile?.fullName || user?.displayName || 'qiparh user'}</Typography>
          <Typography noWrap variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 1 }} />
      <List sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              selected={active}
              sx={{
                my: 0.35,
                borderRadius: 2.2,
                '&.Mui-selected': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.13),
                  boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: active ? 'primary.main' : 'text.secondary' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 800 : 650 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Stack spacing={1} sx={{ p: 1.4, mb: 1, borderRadius: 2.5, bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.14)}` }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Shield fontSize="small" color="warning" />
          <Typography variant="caption" fontWeight={900}>Private workspace</Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">Your records are isolated under your Firebase user ID.</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
        <IconButton onClick={toggleMode} sx={{ flex: 1, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>
        <IconButton onClick={logout} sx={{ flex: 1, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
          <Logout />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { pathname } = useLocation();
  const pageTitle = navItems.find((item) => item.path === pathname)?.label || 'Dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
          },
        }}
        PaperProps={{
          sx: {
            width: drawerWidth,
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.82 : 0.9),
            backdropFilter: 'blur(22px)',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
          },
        }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: { lg: 'none' },
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
          }}
        >
          <IconButton edge="start" onClick={() => setMobileOpen(true)}><Menu /></IconButton>
          <Typography sx={{ ml: 1.5 }} fontWeight={900}>{pageTitle}</Typography>
        </Toolbar>

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          sx={{ px: { xs: 2, sm: 3, xl: 5 }, py: { xs: 2.5, md: 4 }, maxWidth: 1780, mx: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
