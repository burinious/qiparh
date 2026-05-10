import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import { AuthProvider } from './providers/AuthProvider.jsx';
import { ThemeModeProvider } from './providers/ThemeModeProvider.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <CssBaseline />
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" theme="colored" />
      </AuthProvider>
    </ThemeModeProvider>
  </React.StrictMode>,
);
