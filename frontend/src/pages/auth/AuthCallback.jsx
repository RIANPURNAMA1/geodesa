import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function AuthCallback() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        setStatus('success');
      } catch {
        setStatus('error');
      }
    } else if (params.get('error')) {
      setStatus('error');
    } else {
      setStatus('error');
    }
  }, []);

  if (status === 'success') {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Gagal</h1>
          <p className="text-gray-500 mb-4">Gagal login dengan Google. Silakan coba lagi.</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Memproses login...</p>
      </div>
    </div>
  );
}
