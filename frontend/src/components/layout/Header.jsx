import { Menu, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const titleMap = {
  '/dashboard':  'Dashboard',
  '/peta':       'Peta Interaktif',
  '/kategori':   'Kategori',
  '/lokasi':     'Lokasi',
  '/users':      'Pengguna',
  '/notifikasi': 'Notifikasi',
};

export default function Header({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titleMap[pathname] || 'Sistem Zonasi';

  return (
    <header
      className="sticky top-0 z-10 px-4 lg:px-6 h-14 flex items-center justify-between gap-4"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 lg:hidden transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <h1 className="text-base font-bold text-gray-800 tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifikasi')}
          className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
