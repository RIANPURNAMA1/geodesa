import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Phone, User, Building2, Home, Navigation, ChevronLeft, ChevronRight, ArrowLeft, Send, Trash2, MessageSquare, Clock, X, LogIn, Globe } from 'lucide-react';
import { lokasiApi, komentarApi } from '../../api';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../contexts/AuthContext';

function StarRating({ value, onChange, readonly, size }) {
  const s = size || 18;
  return (
    <div className={`flex gap-0.5 ${readonly ? '' : 'cursor-pointer'}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? '' : 'hover:scale-110'} transition-transform`}
        >
          <Star size={s} className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

function FotoGallery({ fotos, nama, latitude, longitude, onOpenLightbox }) {
  const [idx, setIdx] = useState(0);

  if (!fotos?.length) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 aspect-video flex items-center justify-center cursor-pointer"
        onClick={() => onOpenLightbox?.(fotos, 0, nama, latitude, longitude)}>
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3">
            <MapPin size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium">Belum ada foto</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video group cursor-pointer shadow-sm border border-gray-200/40">
        <img src={fotos[idx]?.url} alt={nama} className="w-full h-full object-cover"
          onClick={() => onOpenLightbox?.(fotos, idx, nama, latitude, longitude)} />
        {fotos.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + fotos.length) % fotos.length); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
              <ChevronLeft size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % fotos.length); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-110 shadow-sm' : 'bg-white/50'}`} />
              ))}
            </div>
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              {idx + 1}/{fotos.length}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Lightbox({ fotos, lbIdx, nama, latitude, longitude, onClose, onPrev, onNext, onSetIdx }) {
  const openGmaps = () => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  const openOsrm = () => window.open(`https://www.openstreetmap.org/directions?from=&to=${latitude}%2C${longitude}`, '_blank');

  if (!fotos?.length) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center"
        onClick={onClose}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-10">
          <X size={22} />
        </button>
        <div className="text-center text-white/50 mb-8">
          <MapPin size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Belum ada foto</p>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openGmaps(); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all backdrop-blur-sm">
            <Navigation size={13} /> Google Maps
          </button>
          <button onClick={(e) => { e.stopPropagation(); openOsrm(); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-all backdrop-blur-sm">
            <MapPin size={13} /> Rute OSM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all z-10">
        <X size={22} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
        <ChevronLeft size={24} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
        <ChevronRight size={24} />
      </button>
      <img src={fotos[lbIdx]?.url} alt={nama}
        className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl select-none"
        onClick={(e) => e.stopPropagation()} />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
        {fotos.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); onSetIdx(i); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === lbIdx ? 'bg-white scale-110' : 'bg-white/30'}`} />
        ))}
      </div>
      <div className="absolute bottom-[70px] right-6 text-white/60 text-sm font-mono">
        {lbIdx + 1} / {fotos.length}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <button onClick={(e) => { e.stopPropagation(); openGmaps(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm">
          <Navigation size={15} /> Google Maps
        </button>
        <button onClick={(e) => { e.stopPropagation(); openOsrm(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm">
          <MapPin size={15} /> Rute OSM
        </button>
      </div>
    </div>
  );
}

function InfoSection({ lokasi }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{lokasi.nama_tempat}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {lokasi.kategori && (
                <span className="inline-flex items-center text-xs font-semibold text-white px-2.5 py-0.5 rounded-full shadow-sm"
                  style={{ background: lokasi.kategori.warna || '#6B7280' }}>
                  {lokasi.kategori.nama}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-medium">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-700">{lokasi.rating_rata_rata || '-'}</span>
                <span className="text-gray-400 font-normal text-xs">({lokasi.jumlah_komentar || 0})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lokasi.nama_pemilik && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium">Pemilik</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{lokasi.nama_pemilik}</p>
            </div>
          </div>
        )}
        {lokasi.nomor_telepon && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium">Telepon</p>
              <a href={`tel:${lokasi.nomor_telepon}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 truncate block">{lokasi.nomor_telepon}</a>
            </div>
          </div>
        )}
        {(lokasi.kecamatan_nama || lokasi.kecamatan?.nama) && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-violet-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium">Kecamatan</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{lokasi.kecamatan_nama || lokasi.kecamatan?.nama}</p>
            </div>
          </div>
        )}
        {(lokasi.desa_nama || lokasi.desa?.nama) && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Home size={16} className="text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-medium">Desa</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{lokasi.desa_nama || lokasi.desa?.nama}</p>
            </div>
          </div>
        )}
      </div>

      {lokasi.alamat && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-gray-400 font-medium">Alamat</p>
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">{lokasi.alamat}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-gray-100 shadow-sm">
        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
          <Globe size={16} className="text-rose-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-400 font-medium">Koordinat</p>
          <p className="text-xs font-mono font-semibold text-gray-700">{lokasi.latitude}, {lokasi.longitude}</p>
        </div>
        <a href={`https://www.google.com/maps?q=${lokasi.latitude},${lokasi.longitude}`} target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex-shrink-0">
          Buka Peta
        </a>
      </div>

      {lokasi.deskripsi && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium mb-2">Deskripsi</p>
          <div className="rte-display" dangerouslySetInnerHTML={{ __html: lokasi.deskripsi }} />
        </div>
      )}
    </div>
  );
}

function KomentarForm({ lokasiId, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
          <MessageSquare size={22} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-500 mb-4 font-medium">Login untuk memberikan komentar</p>
        <button onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm">
          <LogIn size={15} /> Login
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!komentar.trim() && rating === 0) return;
    setSubmitting(true);
    try {
      await komentarApi.store(lokasiId, { rating, komentar: komentar.trim() });
      setKomentar('');
      setRating(5);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <MessageSquare size={13} className="text-white" />
          </span>
          Beri Komentar
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-medium">Rating</span>
          <StarRating value={rating} onChange={setRating} size={16} />
        </div>
      </div>
      <textarea
        value={komentar} onChange={(e) => setKomentar(e.target.value)}
        placeholder="Tulis komentar Anda..."
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none bg-white placeholder:text-gray-300 transition-all"
      />
      <div className="flex justify-end">
        <button type="submit"
          disabled={submitting || (!komentar.trim() && rating === 0)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
          <Send size={14} />
          {submitting ? 'Mengirim...' : 'Kirim Komentar'}
        </button>
      </div>
    </form>
  );
}

function KomentarItem({ komentar, onDelete }) {
  const { user } = useAuth();
  const canDelete = user && (user.id === komentar.user_id || user.role === 'admin');
  const date = new Date(komentar.created_at).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const initials = komentar.user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const colors = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
  const colorIdx = komentar.user_id % colors.length;

  return (
    <div className="group py-4 border-b border-gray-50 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-full ${colors[colorIdx]} flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">{komentar.user?.name || 'User'}</p>
              <StarRating value={komentar.rating} readonly size={12} />
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Clock size={10} />{date}
              </span>
            </div>
            {komentar.komentar && (
              <p className="text-sm text-gray-600 leading-relaxed mt-1.5">{komentar.komentar}</p>
            )}
          </div>
        </div>
        {canDelete && (
          <button onClick={() => onDelete?.(komentar.id)}
            className="p-1.5 rounded-lg text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100" title="Hapus komentar">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function LokasiDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lokasi, setLokasi] = useState(null);
  const [komentars, setKomentars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const detailMapRef = useRef(null);
  const detailMapObj = useRef(null);

  const [lbOpen, setLbOpen] = useState(false);
  const [lbFotos, setLbFotos] = useState([]);
  const [lbIdx, setLbIdx] = useState(0);
  const [lbNama, setLbNama] = useState('');
  const [lbLat, setLbLat] = useState(0);
  const [lbLng, setLbLng] = useState(0);

  const openLightbox = useCallback((fotos, idx, nama, lat, lng) => {
    setLbFotos(fotos || []);
    setLbIdx(idx);
    setLbNama(nama);
    setLbLat(lat);
    setLbLng(lng);
    setLbOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLbOpen(false), []);

  const prevLightbox = useCallback(() => {
    setLbIdx(i => (i - 1 + (lbFotos?.length || 1)) % (lbFotos?.length || 1));
  }, [lbFotos]);

  const nextLightbox = useCallback(() => {
    setLbIdx(i => (i + 1) % (lbFotos?.length || 1));
  }, [lbFotos]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lokasiRes, komentarRes] = await Promise.all([
        lokasiApi.show(id),
        komentarApi.list(id),
      ]);
      setLokasi(lokasiRes.data.data);
      setKomentars(komentarRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Lokasi tidak ditemukan' : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const refreshComments = useCallback(async () => {
    try {
      const komentarRes = await komentarApi.list(id);
      setKomentars(komentarRes.data.data);
    } catch {}
  }, [id]);

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (!lokasi || detailMapObj.current) return;
    const lat = parseFloat(lokasi.latitude);
    const lng = parseFloat(lokasi.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    const map = L.map(detailMapRef.current, { zoomControl: false }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${lokasi.nama_tempat}</b><br/>${lokasi.alamat || ''}`);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    setTimeout(() => map.invalidateSize(), 200);
    detailMapObj.current = map;
    return () => { map.remove(); detailMapObj.current = null; };
  }, [lokasi]);

  const handleKomentarDelete = async (komentarId) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await komentarApi.destroy(komentarId);
      setKomentars(prev => prev.filter(k => k.id !== komentarId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f0f4f0 0%, #e8efe8 50%, #f0f4f0 100%)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f0f4f0 0%, #e8efe8 50%, #f0f4f0 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-600 font-semibold mb-1">{error}</p>
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Kembali</button>
        </div>
      </div>
    );
  }

  const avgRating = lokasi.rating_rata_rata;
  const total = komentars.length;

  return (
    <>
      <SEO
        title={lokasi?.nama_tempat || 'Detail Lokasi'}
        description={lokasi?.deskripsi ? lokasi.deskripsi.replace(/<[^>]+>/g, '').slice(0, 160) : `Informasi lengkap tentang ${lokasi?.nama_tempat} di ${lokasi?.desa_nama || ''}, ${lokasi?.kecamatan_nama || ''}.`}
        image={lokasi?.foto_utama || '/logo_cianjur.png'}
        url={lokasi ? `/lokasi/${lokasi.id}` : ''}
        jsonLd={lokasi ? {
          '@context': 'https://schema.org',
          '@type': 'Place',
          'name': lokasi.nama_tempat,
          'description': lokasi.deskripsi ? lokasi.deskripsi.replace(/<[^>]+>/g, '').slice(0, 200) : undefined,
          'image': lokasi.foto_utama || undefined,
          'latitude': lokasi.latitude,
          'longitude': lokasi.longitude,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': lokasi.desa_nama,
            'addressRegion': lokasi.kecamatan_nama,
            'addressCountry': 'ID',
          },
          ...(lokasi.kategori ? { 'category': lokasi.kategori.nama } : {}),
        } : undefined}
      />
      <div className="h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #f0f4f0 0%, #e8efe8 50%, #f0f4f0 100%)' }}>
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/'); }}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{lokasi.nama_tempat}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Map */}
        <div className="relative h-[40vh] lg:h-full lg:flex-1 flex-shrink-0">
          <div ref={detailMapRef} className="absolute inset-0" />
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-[480px] xl:w-[540px] overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200/50 flex-shrink-0">
          <div className="p-5 space-y-6">
            <FotoGallery fotos={lokasi.fotos} nama={lokasi.nama_tempat} latitude={lokasi.latitude} longitude={lokasi.longitude} onOpenLightbox={openLightbox} />

            <InfoSection lokasi={lokasi} />

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <MessageSquare size={14} className="text-white" />
                  </span>
                  Komentar
                  {total > 0 && (
                    <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">{total}</span>
                  )}
                </h3>
                {total > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-yellow-800 text-sm">{avgRating}</span>
                    <span className="text-xs text-yellow-600 font-medium">dari {total} ulasan</span>
                  </div>
                )}
              </div>

              {total > 0 ? (
                <div className="divide-y divide-gray-50">
                  {komentars.map((k) => (
                    <KomentarItem key={k.id} komentar={k} onDelete={handleKomentarDelete} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={24} className="text-gray-300" />
                  </div>
                  <p className="font-semibold text-gray-500 text-sm">Belum ada komentar</p>
                  <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan</p>
                </div>
              )}

              <div className="mt-4">
                <KomentarForm lokasiId={lokasi.id} onSuccess={refreshComments} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {lbOpen && (
        <Lightbox
          fotos={lbFotos}
          lbIdx={lbIdx}
          nama={lbNama}
          latitude={lbLat}
          longitude={lbLng}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
          onSetIdx={setLbIdx}
        />
      )}
      </div>
    </>
  );
}
