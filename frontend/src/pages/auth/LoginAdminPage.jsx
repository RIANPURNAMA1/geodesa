import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoCianjur from '../../assets/logo_cianjur.png';

export default function LoginAdminPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Login gagal. Periksa email dan password Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8efe8 50%, #f0f4f0 100%)',
      }}
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src={logoCianjur} alt="Logo Cianjur"
              className="w-20 h-20 mx-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sistem Zonasi GIS</h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium">Sistem Informasi Geografis Berbasis Web</p>
        </div>

        <div className="p-8 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Masuk ke Akun Anda</h2>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50/80 border border-red-100 text-sm font-medium text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@zonasi.id"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
              ) : (
                <><LogIn size={16} /> Masuk</>
              )}
            </button>
          </form>

          <div className="mt-6 p-3.5 rounded-xl"
            style={{
              background: 'rgba(243, 244, 246, 0.6)',
              border: '1px solid rgba(229, 231, 235, 0.4)',
            }}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Akun Demo</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Admin: <span className="font-mono text-gray-600 font-medium">admin@zonasi.id</span></p>
              <p>Operator: <span className="font-mono text-gray-600 font-medium">operator@zonasi.id</span></p>
              <p>Password: <span className="font-mono text-gray-600 font-medium">password</span></p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">
              Kembali ke halaman utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
