import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Swal from 'sweetalert2';
import { authApi } from '../../api';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../contexts/AuthContext';
import logoCianjur from '../../assets/logo_cianjur.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmail = identifier.includes('@');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    setError('');

    try {
      if (isEmail) {
        const user = await login(identifier, password);
        Swal.fire({ icon: 'success', title: 'Berhasil Masuk', text: `Selamat datang, ${user.name}!`, timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        navigate(user.role === 'user' ? '/' : '/dashboard');
      } else {
        const res = await authApi.registerPublic({ name: identifier.trim(), password });
        const { user, token } = res.data.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        await refreshUser();
        Swal.fire({ icon: 'success', title: 'Berhasil Masuk', text: `Selamat datang, ${user.name}!`, timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || 'Gagal masuk';
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
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative">
        <SEO title="Masuk" description="Halaman masuk untuk Admin, Operator Desa, dan pengguna umum Desa Cibulakan Cianjur." url="/login" />
        <div className="text-center mb-6">
          <div className="mb-4">
            <img src={logoCianjur} alt="Logo Cianjur"
              className="w-20 h-20 mx-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Zonasi GIS</h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium">Peta Interaktif UMKM</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Desa Cibulakan Cianjur</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama atau Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input pl-9" placeholder="Nama atau email..."
                  value={identifier} onChange={e => setIdentifier(e.target.value)} required autoFocus />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} className="input pl-9 pr-10"
                  placeholder="Masukkan password..."
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center font-medium bg-red-50/80 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading || !identifier.trim() || !password}
              className="btn-primary w-full justify-center py-3">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
              ) : (
                <><LogIn size={16} /> Masuk</>
              )}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
            Masukkan nama untuk pengguna biasa, atau email untuk Admin / Operator.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
          Dengan melanjutkan, kamu menyetujui <br />
          <span className="text-gray-300">Ketentuan Layanan</span> dan <span className="text-gray-300">Kebijakan Privasi</span>
        </p>
      </div>
    </div>
  );
}
