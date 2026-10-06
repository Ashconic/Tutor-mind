import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import theme from './theme';
import { LanguageProvider } from './i18n/LanguageContext';
import './chat.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TutorMind Student Portal caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7f5ef',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#fffdf8',
            border: '1px solid #e6e2d9',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '520px',
            boxShadow: '0 10px 30px rgba(44,39,27,.08)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>💡</div>
            <h2 style={{ color: '#20211f', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
              Learning Session Recovered
            </h2>
            <p style={{ color: '#73726a', fontSize: '14px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We refreshed your learning session. Click below to continue your lessons or reload.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.href = '/';
                }}
                style={{
                  backgroundColor: '#ec735e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(236,115,94,0.3)'
                }}
              >
                Return to Learning
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#20211f',
                  border: '1px solid #dcd8cf',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f5ef;font-family:Inter,sans-serif;padding:2rem;">
        <div style="background:#fffdf8;border:1px solid #e6e2d9;border-radius:16px;padding:2.5rem;max-width:520px;text-align:center;box-shadow:0 10px 30px rgba(44,39,27,.08);">
          <div style="font-size:40px;margin-bottom:1rem;">💡</div>
          <h2 style="color:#20211f;margin-bottom:0.5rem;font-weight:800;">TutorMind Ready</h2>
          <p style="color:#73726a;font-size:14px;line-height:1.6;margin-bottom:1.5rem;">Session refreshed. Click below to reload your lessons.</p>
          <button onclick="localStorage.removeItem('tutormind-user');localStorage.removeItem('mathlingo-user');window.location.reload();" style="background:#ec735e;color:#ffffff;border:none;border-radius:8px;padding:12px 24px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(236,115,94,0.3);">Reload Dashboard</button>
        </div>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <LanguageProvider>
              <CssBaseline />
              <App />
            </LanguageProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
