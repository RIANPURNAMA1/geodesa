import { useState } from 'react';
import { MapPin, Phone, User, Building2, Home, Tags, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LokasiDetail({ lokasi }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const fotos = lokasi.fotos || [];

  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${lokasi.latitude},${lokasi.longitude}`, '_blank');
  };

  const openOsrm = () => {
    window.open(`https://www.openstreetmap.org/directions?from=&to=${lokasi.latitude}%2C${lokasi.longitude}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {fotos.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
          <img src={fotos[photoIdx]?.url} alt={lokasi.nama_tempat} className="w-full h-full object-cover" />
          {fotos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + fotos.length) % fotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % fotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === photoIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 border border-gray-100 aspect-video flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Belum ada foto</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lokasi.nama_tempat}</h2>
            {lokasi.kategori && (
              <span className="badge text-white text-xs mt-1" style={{ background: lokasi.kategori.warna || '#6B7280' }}>
                {lokasi.kategori.nama}
              </span>
            )}
          </div>
          <span className={`badge flex-shrink-0 ${lokasi.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {lokasi.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {lokasi.nama_pemilik && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
              <User size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Pemilik</p>
                <p className="font-medium text-gray-800">{lokasi.nama_pemilik}</p>
              </div>
            </div>
          )}
          {lokasi.nomor_telepon && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
              <Phone size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Telepon</p>
                <a href={`tel:${lokasi.nomor_telepon}`} className="font-medium text-blue-600">{lokasi.nomor_telepon}</a>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
            <Building2 size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Kecamatan</p>
              <p className="font-medium text-gray-800">{lokasi.kecamatan_nama || lokasi.kecamatan?.nama}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
            <Home size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Desa</p>
              <p className="font-medium text-gray-800">{lokasi.desa_nama || lokasi.desa?.nama}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 col-span-full">
            <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Alamat</p>
              <p className="font-medium text-gray-800">{lokasi.alamat}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50">
            <Navigation size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Koordinat</p>
              <p className="font-mono text-xs text-gray-700">{lokasi.latitude}, {lokasi.longitude}</p>
            </div>
          </div>
        </div>

        {lokasi.deskripsi && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-400 mb-1">Deskripsi</p>
            <div className="rte-display" dangerouslySetInnerHTML={{ __html: lokasi.deskripsi }} />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={openGoogleMaps} className="btn-secondary btn-sm flex-1 justify-center text-xs">
          <Navigation size={12} /> Google Maps
        </button>
        <button onClick={openOsrm} className="btn-secondary btn-sm flex-1 justify-center text-xs">
          <MapPin size={12} /> Rute OpenStreetMap
        </button>
      </div>
    </div>
  );
}
