import { useState } from 'react';
import { X, User, Lock, LogIn } from 'lucide-react';
import { authApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await authApi.registerPublic({ name: name.trim(), password });
      const { user, token } = res.data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      setName('');
      setPassword('');
      await refreshUser();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Masuk untuk Berkomentar</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nama Anda</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9 text-sm" placeholder="Masukkan nama..."
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="input pl-9 text-sm" placeholder="Password (min 4)..."
                value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 text-center font-medium">{error}</p>
          )}
          <button type="submit" disabled={submitting || !name.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {submitting ? 'Memproses...' : <><LogIn size={15} /> Masuk</>}
          </button>
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            Jika nama sudah terdaftar, gunakan password yang sama.
          </p>
        </form>
      </div>
    </div>
  );
}
