import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const isTeacherPortal = typeof window !== 'undefined' && (
    window.location.port === '5174' ||
    window.location.pathname.includes('teacher')
  );

  const token = isTeacherPortal
    ? (localStorage.getItem('tutormind-teacher-token') || localStorage.getItem('tutormind-token') || localStorage.getItem('mathlingo-teacher-token') || localStorage.getItem('mathlingo-token'))
    : (localStorage.getItem('tutormind-token') || localStorage.getItem('tutormind-user-token') || localStorage.getItem('mathlingo-token') || localStorage.getItem('mathlingo-user-token'));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const storedUser = isTeacherPortal
      ? JSON.parse(localStorage.getItem('tutormind-teacher-user') || localStorage.getItem('tutormind-user') || localStorage.getItem('mathlingo-teacher-user') || localStorage.getItem('mathlingo-user') || 'null')
      : JSON.parse(localStorage.getItem('tutormind-user') || localStorage.getItem('mathlingo-user') || 'null');

    if (storedUser?.email) {
      config.headers['x-user-email'] = storedUser.email;
      config.headers['x-user-name'] = storedUser.name || storedUser.username || '';
      config.headers['x-user-id'] = storedUser.id || '';
      config.headers['x-user-role'] = storedUser.role || (isTeacherPortal ? 'teacher' : 'student');
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;

