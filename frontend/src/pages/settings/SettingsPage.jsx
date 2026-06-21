import { useState } from 'react';
import { Settings, User, Lock, Save } from 'lucide-react';
import { settingsApi } from '../../api';
import { useAuth }    from '../../contexts/AuthContext';
import { useToast }   from '../../components/common/Toast';

export default function SettingsPage() {
  const toast = useToast();
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await settingsApi.updateProfile(profile);
      await refreshUser();
      toast.success('Profil berhasil diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.new_password) {
      toast.error('Password baru wajib diisi');
      return;
    }
    if (passwords.new_password.length < 4) {
      toast.error('Password baru minimal 4 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      await settingsApi.updatePassword(passwords);
      toast.success('Password berhasil diperbarui');
      setPasswords({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <User size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Profil</h2>
            <p className="text-xs text-gray-400">Perbarui informasi profil Anda</p>
          </div>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
            <input
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Role: <span className="font-semibold text-gray-600 capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-sm"
            >
              {savingProfile ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lock size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Password</h2>
            <p className="text-xs text-gray-400">Ganti password akun Anda</p>
          </div>
        </div>
        <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password Saat Ini</label>
            <input
              type="password"
              value={passwords.current_password}
              onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all"
              placeholder="Kosongkan jika lupa password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password Baru</label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all"
              required
              minLength={4}
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-all shadow-sm"
            >
              {savingPassword ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              Ganti Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
