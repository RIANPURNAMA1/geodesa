import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tags, TrendingUp, ArrowRight, Users, MessageSquare, Building2, Home } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#059669','#10B981','#34D399','#6EE7B7','#A7F3D0','#D1FAE5'];

function StatCard({ icon: Icon, label, value, gradient, to }) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper to={to}
      className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: gradient }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '–'}</p>
      </div>
      {to && <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />}
    </Wrapper>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    dashboardApi.index()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => requestAnimationFrame(() => setPageReady(true)));
    }
  }, [loading]);

  if (loading) return <LoadingSpinner />;

  const pieData  = (data?.statistik_kategori || []).map(k => ({ name: k.nama, value: k.total }));
  const kecKategoriRaw = data?.statistik_kecamatan_kategori || [];

  const allKategoriNames = [...new Set(kecKategoriRaw.flatMap(k => k.kategoris.map(c => c.kategori_nama)))];
  const kategoriWarna = {};
  kecKategoriRaw.forEach(k => k.kategoris.forEach(c => { kategoriWarna[c.kategori_nama] = c.warna; }));
  const kelompokData = kecKategoriRaw.map(k => {
    const row = { name: k.nama };
    allKategoriNames.forEach(cat => { row[cat] = 0; });
    k.kategoris.forEach(c => { row[c.kategori_nama] = c.total; });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className={`${pageReady ? 'anim-fade-up-1' : 'opacity-0'}`}>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
          Selamat datang, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">Berikut ringkasan data zonasi hari ini</p>
      </div>

      {/* Stat cards */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${pageReady ? 'anim-fade-up-2' : 'opacity-0'}`}>
        <StatCard icon={MapPin}       label="Total Lokasi"    value={data?.total_lokasi}    gradient="linear-gradient(135deg, #0D2B36, #123B49)" to="/lokasi" />
        <StatCard icon={Tags}         label="Total Kategori"  value={data?.total_kategori}  gradient="linear-gradient(135deg, #059669, #10B981)" to="/kategori" />
        <StatCard icon={Building2}    label="Kecamatan"       value={data?.total_kecamatan} gradient="linear-gradient(135deg, #7C3AED, #8B5CF6)" to="/lokasi" />
        <StatCard icon={Home}         label="Desa"            value={data?.total_desa}      gradient="linear-gradient(135deg, #D97706, #F59E0B)" to="/lokasi" />
        <StatCard icon={MessageSquare} label="Komentar"       value={data?.total_komentar}  gradient="linear-gradient(135deg, #DC2626, #EF4444)" to={null} />
        <StatCard icon={Users}        label="Pengguna"        value={data?.total_pengguna}  gradient="linear-gradient(135deg, #0891B2, #06B6D4)" to={null} />
      </div>

      {/* Section Title */}
      <div className={`flex items-center gap-3 ${pageReady ? 'anim-fade-up-3' : 'opacity-0'}`}>
        <span className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
        <h2 className="text-base font-bold text-gray-800 tracking-tight">Statistik</h2>
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${pageReady ? 'anim-fade-up-4' : 'opacity-0'}`}>
        {/* Pie chart */}
        <div className="p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-emerald-500" />
            Persebaran per Kategori
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v + ' lokasi', 'Total']} />
                <Legend formatter={(v) => <span className="text-xs text-gray-500">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Belum ada data</div>
          )}
        </div>

        {/* Donut grid: per Kecamatan */}
        <div className="p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-emerald-500" />
            Kategori per Kecamatan
          </h3>
          {kelompokData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={kelompokData} margin={{ left: -10, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                {allKategoriNames.map((cat, i) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    fill={kategoriWarna[cat] || COLORS[i % COLORS.length]}
                    radius={[4,4,0,0]}
                    maxBarSize={28}
                    label={({ x, y, width, value, payload }) => {
                      if (!value || value === 0) return null;
                      const total = allKategoriNames.reduce((s, c) => s + ((payload || {})[c] || 0), 0);
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                      if (pct < 5) return null;
                      return (
                        <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={10} fill="#6b7280" fontWeight={600}>
                          {pct}%
                        </text>
                      );
                    }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">Belum ada data</div>
          )}
        </div>
      </div>

      {/* Category table */}
      <div className={`p-5 rounded-2xl ${pageReady ? 'anim-fade-up-5' : 'opacity-0'}`}
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-sm">Ringkasan per Kategori</h3>
          <span className="text-xs text-gray-400 font-medium">{data?.total_lokasi || 0} total lokasi</span>
        </div>
        <div className="space-y-3">
          {(data?.statistik_kategori || []).map((k, i) => {
            const pct = data.total_lokasi > 0 ? ((k.total / data.total_lokasi) * 100) : 0;
            const color = COLORS[i % COLORS.length];
            return (
              <div key={k.id} className="group">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm" style={{ background: color }} />
                    <span className="text-sm font-semibold text-gray-700 truncate">{k.nama}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-extrabold text-gray-900 tabular-nums">{k.total}</span>
                    <span className="text-xs font-medium text-gray-400 w-12 text-right tabular-nums">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100/80 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: pageReady ? `${Math.max(pct, 2)}%` : '0%',
                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
          {(!data?.statistik_kategori || data.statistik_kategori.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-sm">Belum ada data kategori</div>
          )}
        </div>
      </div>
    </div>
  );
}
