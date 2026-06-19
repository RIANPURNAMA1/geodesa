import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, Tags, MapPin,
  Users, LogOut, X, Bell, Settings
} from 'lucide-react';
import logoCianjur from '../../assets/logo_cianjur.png';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',       icon: LayoutDashboard, roles: ['admin','operator_desa'] },
  { to: '/peta',       label: 'Peta Interaktif',  icon: Map,           roles: ['admin','operator_desa'] },
  { to: '/notifikasi', label: 'Notifikasi',       icon: Bell,          roles: ['admin','operator_desa'] },
  { to: '/kategori',   label: 'Kategori',         icon: Tags,          roles: ['admin'] },
  { to: '/lokasi',     label: 'Lokasi',           icon: MapPin,        roles: ['admin','operator_desa'] },
  { to: '/users',      label: 'Pengguna',         icon: Users,         roles: ['admin'] },
];

const bottomItems = [
  { icon: Settings, label: 'Pengaturan' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Yakin ingin keluar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;
    await logout();
    navigate('/login');
  };

  const visible = navItems.filter(n => n.roles.includes(user?.role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-[260px] flex flex-col
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
        style={{
          background: 'linear-gradient(180deg, #0D2B36 0%, #123B49 40%, #1A4A5A 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-5 py-6">
          <img src={logoCianjur} alt="Logo Cianjur"
            className="w-12 h-12 object-contain flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-white text-base leading-tight tracking-tight">Desa Cibulakan Cianjur</p>
            <p className="text-[11px] text-emerald-300/70 font-medium tracking-wide">Sistem Informasi Geografis</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                 ${isActive
                   ? 'text-[#0D2B36] shadow-sm'
                   : 'text-white/60 hover:text-white hover:bg-white/8'
                 }`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #5AD67D, #34D399)',
                boxShadow: '0 2px 12px rgba(90, 214, 125, 0.25)',
              } : {}}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="relative px-3 pb-3 space-y-0.5">
          <div className="border-t border-white/5 mx-2 mb-3" />
          {bottomItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-150"
            >
              <item.icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="relative px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(90,214,125,0.25), rgba(52,211,153,0.25))',
              }}
            >
              <span className="text-emerald-300 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white/90 truncate">{user?.name}</p>
              <p className="text-[11px] text-white/40 font-medium capitalize tracking-wide">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                       text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
