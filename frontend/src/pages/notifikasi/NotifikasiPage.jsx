import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, MapPin, ChevronRight, Star, Clock, ExternalLink } from 'lucide-react';
import { notifikasiApi } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function NotifikasiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await notifikasiApi.index();
        setData(res.data.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Notifikasi</h1>
        <p className="text-sm text-gray-400 mt-1">Aktivitas komentar terbaru per lokasi</p>
      </div>

      {data.length === 0 ? (
        <div className="p-10 text-center text-gray-400 text-sm rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          Belum ada komentar
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((group) => (
            <div key={group.lokasi_id}
              className="p-5 rounded-2xl animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              {/* Header lokasi */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
                    <Link to={`/lokasi/${group.lokasi_id}`}
                      className="font-bold text-gray-800 text-sm hover:text-emerald-600 transition-colors truncate"
                    >
                      {group.nama_tempat}
                    </Link>
                  </div>
                  <p className="text-[11px] text-gray-400 ml-6">{group.wilayah}</p>
                </div>
                {group.kategori && (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      backgroundColor: group.kategori.warna + '20',
                      color: group.kategori.warna,
                    }}
                  >
                    {group.kategori.nama}
                  </span>
                )}
              </div>

              {/* Daftar komentar */}
              <div className="space-y-2">
                {group.komentars.map((k) => (
                  <div key={k.id}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.5)' }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.15))',
                      }}
                    >
                      <span className="text-emerald-600 font-bold text-[11px]">
                        {k.user?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-700">{k.user}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={10}
                              className={i < k.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 ml-auto">{k.waktu}</span>
                      </div>
                      {k.komentar && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{k.komentar}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Link to={`/lokasi/${group.lokasi_id}`}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Lihat detail lokasi <ExternalLink size={11} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
