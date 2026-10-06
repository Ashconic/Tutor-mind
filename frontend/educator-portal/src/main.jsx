import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import TeacherPortal from '../../src/TeacherPortal';
import '../../src/chat.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TutorMind Educator Portal caught an error:', error, errorInfo);
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
          backgroundColor: '#f8fafc',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '520px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>👨‍🏫</div>
            <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
              Educator Portal Recovered
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We refreshed your session state. Click below to continue managing your classroom.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#0ea5e9',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(14,165,233,0.3)'
                }}
              >
                Refresh Portal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const educatorTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0ea5e9',
      dark: '#0284c7'
    },
    secondary: {
      main: '#10b981'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
});

function EducatorApp() {
  const handleSwitchToStudent = () => {
    const studentUrl = window.location.origin.includes(':5174')
      ? window.location.origin.replace(':5174', ':5173')
      : 'http://localhost:5173';
    window.location.href = studentUrl;
  };

  return (
    <ThemeProvider theme={educatorTheme}>
      <CssBaseline />
      <TeacherPortal onSwitchToStudent={handleSwitchToStudent} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <EducatorApp />
    </ErrorBoundary>
  </React.StrictMode>
);
