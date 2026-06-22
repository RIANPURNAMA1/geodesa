import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import iconPaths from '../../utils/iconPaths';
import 'leaflet/dist/leaflet.css';
import { lokasiApi, kategoriApi, wilayahApi, routingApi } from '../../api';
import { Filter, Search, Layers, Target, X, ChevronDown, ChevronUp, LocateFixed, Route, Plus, Crosshair, Image as ImageIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import RichTextEditor from '../../components/common/RichTextEditor';
import { useAuth } from '../../contexts/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Cache dynamic imports di module level (hanya di-load sekali)
let clusterImport = null;
let heatImport = null;
async function getCluster() {
  if (!clusterImport) {
    try {
      await import('leaflet.markercluster');
      await import('leaflet.markercluster/dist/MarkerCluster.css');
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
      clusterImport = true;
    } catch { clusterImport = false; }
  }
  return clusterImport;
}
async function getHeat() {
  if (!heatImport) {
    try {
      await import('leaflet.heat');
      heatImport = true;
    } catch { heatImport = false; }
  }
  return heatImport;
}

function categoryIcon(warna, ikon, fotoUrl) {
  const color = warna || '#3B82F6';
  const iconSvg = ikon && iconPaths[ikon]
    ? `<g transform="translate(12,12) scale(0.55) translate(-12,-12)" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconPaths[ikon]}</g>`
    : '<circle cx="12" cy="12" r="5" fill="white"/>';
  const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z" fill="${color}"/>
    ${iconSvg}
  </svg>`;
  const fotoHtml = fotoUrl
    ? `<div style="width:20px;height:20px;border-radius:50%;overflow:hidden;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);margin:-6px auto 0;background:white;">
        <img src="${fotoUrl}" style="width:100%;height:100%;object-fit:cover;display:block" />
      </div>`
    : '';
  const hasFoto = !!fotoUrl;
  const h = hasFoto ? 50 : 36;
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;">${pinSvg}${fotoHtml}</div>`,
    className: '',
    iconSize: [24, h],
    iconAnchor: [12, h],
    popupAnchor: [0, -h],
  });
}

function popupHtml(item) {
  const fotos = item.fotos || [];
  const imgHtml = fotos.length > 0
    ? `<img src="${fotos[0].url}" class="w-full h-32 object-cover rounded-t-xl" />`
    : '';
  const wa = item.nomor_telepon ? item.nomor_telepon.replace(/^0+/, '62').replace(/[^0-9]/g, '') : '';
  return `
    <div class="w-72">
      ${imgHtml}
      <div class="p-4">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-bold text-gray-900 text-sm leading-snug">${item.nama_tempat}</h3>
          ${item.kategori ? `<span class="text-xs px-2.5 py-0.5 rounded-full text-white font-semibold flex-shrink-0" style="background:${item.kategori.warna||'#6B7280'}">${item.kategori.nama}</span>` : ''}
        </div>
        ${item.alamat ? `<p class="text-xs text-gray-500 mb-2">${item.alamat}</p>` : ''}
        <div class="space-y-1.5 text-sm text-gray-600">
          ${item.nama_pemilik ? `<div class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${item.nama_pemilik}</div>` : ''}
          ${item.nomor_telepon ? `<div class="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <a href="tel:${item.nomor_telepon}" class="text-blue-600 hover:underline flex-1">${item.nomor_telepon}</a>${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors" title="Chat WhatsApp"><svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>` : ''}</div>` : ''}
          ${item.kecamatan_nama || item.kecamatan?.nama ? `<div class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${item.kecamatan_nama || item.kecamatan?.nama}</div>` : ''}
        </div>
        <div class="mt-3 flex flex-col gap-2">
          <div class="grid grid-cols-2 gap-2">
            <a href="https://www.google.com/maps?q=${item.latitude},${item.longitude}" target="_blank" rel="noopener noreferrer"
              class="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Google Maps
            </a>
            <button onclick="window.__showRoute(${item.latitude}, ${item.longitude})"
              class="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all w-full cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 6 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              Rute
            </button>
          </div>
          <button onclick="window.location.href='/lokasi/${item.id}'"
            class="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── Memoized Sidebar Sections ──────────────

const FilterPanel = memo(function FilterPanel({
  filterOpen, setFilterOpen, searchTerm, setSearchTerm,
  filters, setF, provinsis, kabupatens, kecamatans, desas, kategoris,
  showHeat, setShowHeat, loading, loadMarkers,
}) {
  return (
    <div className="card">
      <button onClick={() => setFilterOpen(!filterOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 font-semibold text-sm text-gray-700 hover:bg-black/5 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Filter size={13} className="text-white" />
          </span>
          Filter Peta
        </span>
        {filterOpen ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {filterOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100/50 pt-3 max-h-[50vh] overflow-y-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input text-sm pl-9" placeholder="Cari UMKM..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label className="label">Provinsi</label>
            <select className="input text-sm" value={filters.provinsi_id} onChange={setF('provinsi_id')}>
              <option value="">Semua Provinsi</option>
              {provinsis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kabupaten</label>
            <select className="input text-sm" value={filters.kabupaten_id} onChange={setF('kabupaten_id')} disabled={!filters.provinsi_id}>
              <option value="">Semua Kabupaten</option>
              {kabupatens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kecamatan</label>
            <select className="input text-sm" value={filters.kecamatan_id} onChange={setF('kecamatan_id')} disabled={!filters.kabupaten_id}>
              <option value="">Semua Kecamatan</option>
              {kecamatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Desa</label>
            <select className="input text-sm" value={filters.desa_id} onChange={setF('desa_id')} disabled={!filters.kecamatan_id}>
              <option value="">Semua Desa</option>
              {desas.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select className="input text-sm" value={filters.kategori_id} onChange={setF('kategori_id')}>
              <option value="">Semua Kategori</option>
              {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative w-4 h-4">
              <input type="checkbox" className="sr-only"
                checked={showHeat} onChange={e => setShowHeat(e.target.checked)} />
              <div className={`w-4 h-4 rounded border-2 transition-all duration-150 flex items-center justify-center
                ${showHeat ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                {showHeat && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Tampilkan Heatmap</span>
          </label>
          <button onClick={loadMarkers} className="btn-primary w-full justify-center text-sm" disabled={loading}>
            {loading ? 'Memuat...' : <><Search size={14} /> Terapkan Filter</>}
          </button>
        </div>
      )}
    </div>
  );
});

const LocationCard = memo(function LocationCard({ userLocation, handleGetLocation, clearRoute, routeLineRef }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
          <LocateFixed size={12} className="text-white" />
        </span>
        Lokasi Saya
      </h3>
      {userLocation ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Lat: {userLocation.lat.toFixed(6)}</p>
            <p>Lng: {userLocation.lng.toFixed(6)}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGetLocation} className="btn-secondary flex-1 justify-center text-xs py-2">Perbarui</button>
            {routeLineRef.current && (
              <button onClick={clearRoute} className="btn-secondary btn-sm"><X size={13} /></button>
            )}
          </div>
        </div>
      ) : (
        <button onClick={handleGetLocation} className="btn-primary w-full justify-center text-xs py-2">
          <LocateFixed size={13} /> Deteksi Lokasi Saya
        </button>
      )}
    </div>
  );
});

const RouteCard = memo(function RouteCard({ routeMode, setRouteMode, routeStep, setRouteStep, routeStart, setRouteStart, routeEnd, setRouteEnd, routeData, setRouteData, clearRoute, routeLineRef }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
          <Route size={12} className="text-white" />
        </span>
        Rute
      </h3>
      {!routeMode ? (
        <button onClick={() => { setRouteMode(true); setRouteStart(null); setRouteEnd(null); setRouteStep(1); }}
          className="btn-primary w-full justify-center text-xs py-2">
          <Route size={13} /> Buat Rute
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            {routeStep === 1 ? 'Klik peta untuk titik mulai (A)' :
             routeStep === 2 ? 'Klik peta untuk titik tujuan (B)' : 'Rute siap'}
          </p>
          {routeStart && (
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">A</span>
              {routeStart.lat}, {routeStart.lng}
            </div>
          )}
          {routeEnd && (
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">B</span>
              {routeEnd.lat}, {routeEnd.lng}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setRouteStart(null); setRouteEnd(null); setRouteStep(1); setRouteData(null); }}
              className="btn-secondary flex-1 justify-center text-xs py-1.5">Ulang</button>
            <button onClick={() => { setRouteMode(false); setRouteStart(null); setRouteEnd(null); setRouteStep(0); setRouteData(null); }}
              className="btn-secondary btn-sm"><X size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
});

const RouteInfoCard = memo(function RouteInfoCard({ routeData, clearRoute }) {
  if (!routeData) return null;
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-400 to-violet-600" />
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-2">
        <Route size={14} className="text-violet-500" /> Informasi Rute
      </h3>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Jarak: <span className="font-bold text-gray-800">{routeData.distance} km</span></p>
        <p>Estimasi: <span className="font-bold text-gray-800">{routeData.duration}</span></p>
      </div>
      <button onClick={clearRoute} className="mt-2 text-xs font-medium text-red-400 hover:text-red-600 transition-colors">Tutup Rute</button>
    </div>
  );
});

const RadiusCard = memo(function RadiusCard({ radius, setRadius, handleRadiusSearch, clearRadius, radiusRef }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <Target size={12} className="text-white" />
        </span>
        Radius Search
      </h3>
      <p className="text-xs text-gray-400 mb-3">Klik peta untuk memilih titik pusat.</p>
      <div className="space-y-2">
        <input className="input text-xs font-mono" placeholder="Latitude" value={radius.lat}
          onChange={e => setRadius(p => ({ ...p, lat: e.target.value }))} />
        <input className="input text-xs font-mono" placeholder="Longitude" value={radius.lng}
          onChange={e => setRadius(p => ({ ...p, lng: e.target.value }))} />
        <div className="flex gap-2">
          <input className="input text-xs flex-1" placeholder="Radius (km)" type="number" min="0.1" max="100"
            value={radius.km} onChange={e => setRadius(p => ({ ...p, km: e.target.value }))} />
        </div>
        <div className="flex gap-2">
          <button onClick={handleRadiusSearch} className="btn-primary flex-1 justify-center text-xs py-2">Cari</button>
          {radiusRef.current && (
            <button onClick={clearRadius} className="btn-secondary btn-sm"><X size={13} /></button>
          )}
        </div>
      </div>
    </div>
  );
});

const NearestUmkmCard = memo(function NearestUmkmCard({ nearestUmkms, onDetail }) {
  if (nearestUmkms.length === 0) return null;
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-2">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
          <Target size={12} className="text-white" />
        </span>
        UMKM Terdekat
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {nearestUmkms.map(u => (
          <div key={u.id} onClick={() => onDetail(u.id)}
            className="text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
            <p className="font-medium text-gray-800">{u.nama_tempat}</p>
            <p className="text-gray-400">{u.jarak_km.toFixed(2)} km
              {u.kategori && <span className="ml-2">• {u.kategori.nama}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

const LegendCard = memo(function LegendCard({ kategoris }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
          <Layers size={12} className="text-white" />
        </span>
        Kategori
      </h3>
      <div className="space-y-2.5">
        {kategoris.map(k => (
          <div key={k.id} className="flex items-center gap-2.5 text-xs text-gray-500 group hover:text-gray-700 transition-colors">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm transition-transform group-hover:scale-110"
              style={{ background: k.warna||'#6B7280' }} />
            <span className="font-medium">{k.nama}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const StatsCard = memo(function StatsCard({ loading, count }) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-bl-full" />
      <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Menampilkan</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{loading ? '–' : count}</p>
      <p className="text-xs text-gray-400 mt-0.5">lokasi UMKM di peta</p>
    </div>
  );
});

async function drawRegionBoundaries(map, lokasis, regionRef) {
  if (regionRef.current) {
    regionRef.current.forEach(l => map.removeLayer(l));
  }
  const layers = [];
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const kabSet = new Set();
  const kecMap = {};
  const desaMap = {};

  lokasis.forEach(l => {
    if (l.kabupaten_nama) kabSet.add(l.kabupaten_nama);
    if (l.kabupaten_nama && l.kecamatan_nama) {
      kecMap[l.kabupaten_nama + '||' + l.kecamatan_nama] = { kab: l.kabupaten_nama, kec: l.kecamatan_nama };
    }
    if (l.kabupaten_nama && l.kecamatan_nama && l.desa_nama) {
      desaMap[l.kabupaten_nama + '||' + l.kecamatan_nama + '||' + l.desa_nama] = { kab: l.kabupaten_nama, kec: l.kecamatan_nama, desa: l.desa_nama };
    }
  });

  for (const nama of kabSet) {
    try {
      const res = await wilayahApi.geocode({ kabupaten: nama });
      const geo = res.data.data;
      if (geo?.geojson) {
        layers.push(L.geoJSON(geo.geojson, { style: { color: '#3B82F6', weight: 2, opacity: 0.5, fillColor: '#3B82F6', fillOpacity: 0.06 } }).addTo(map));
      } else if (geo?.boundingbox) {
        const [s, n, w, e] = geo.boundingbox.map(Number);
        layers.push(L.rectangle([[s, w], [n, e]], { color: '#3B82F6', weight: 2, opacity: 0.5, fillColor: '#3B82F6', fillOpacity: 0.06 }).addTo(map));
      }
    } catch {}
    await delay(300);
  }

  for (const item of Object.values(kecMap)) {
    try {
      const res = await wilayahApi.geocode({ kabupaten: item.kab, kecamatan: item.kec });
      const geo = res.data.data;
      if (geo?.geojson) {
        layers.push(L.geoJSON(geo.geojson, { style: { color: '#10B981', weight: 1.5, opacity: 0.4, fillColor: '#10B981', fillOpacity: 0.08 } }).addTo(map));
      }
    } catch {}
    await delay(300);
  }

  for (const item of Object.values(desaMap)) {
    try {
      const res = await wilayahApi.geocode({ kabupaten: item.kab, kecamatan: item.kec, desa: item.desa });
      const geo = res.data.data;
      if (geo?.geojson) {
        layers.push(L.geoJSON(geo.geojson, { style: { color: '#F59E0B', weight: 1, opacity: 0.3, fillColor: '#F59E0B', fillOpacity: 0.1 } }).addTo(map));
      }
    } catch {}
    await delay(300);
  }

  regionRef.current = layers;
}

// ── Main Component ──────────────────────────

export default function PetaPage() {
  const mapRef       = useRef(null);
  const mapObj       = useRef(null);
  const layerRef     = useRef(null);
  const heatRef      = useRef(null);
  const radiusRef    = useRef(null);
  const boundaryRef  = useRef(null);
  const regionRef   = useRef(null);
  const wilayaNama  = useRef({ provinsi:'', kabupaten:'', kecamatan:'', desa:'' });
  const autoTimer   = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const routeStartMarkerRef = useRef(null);
  const routeEndMarkerRef = useRef(null);
  const lokasisRef  = useRef([]);
  const firstLoad   = useRef(true);

  const [loading,     setLoading]    = useState(true);
  const [filterOpen,  setFilterOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [showHeat,    setShowHeat]   = useState(false);
  const [provinsis,   setProvinsis]  = useState([]);
  const [kabupatens,  setKabupatens] = useState([]);
  const [kecamatans,  setKecamatans] = useState([]);
  const [desas,       setDesas]      = useState([]);
  const [kategoris,   setKategoris]  = useState([]);
  const [filters,     setFilters]    = useState({ provinsi_id:'', kabupaten_id:'', kecamatan_id:'', desa_id:'', kategori_id:'' });
  const [radius,      setRadius]     = useState({ lat:'', lng:'', km:'' });
  const [count,       setCount]      = useState(0);
  const [searchTerm,  setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeMode, setRouteMode] = useState(false);
  const [routeStep, setRouteStep] = useState(0);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const routeModeRef = useRef(false);
  const routeStartRef = useRef(null);
  const routeEndRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => { routeModeRef.current = routeMode; }, [routeMode]);
  useEffect(() => { routeStartRef.current = routeStart; }, [routeStart]);
  useEffect(() => { routeEndRef.current = routeEnd; }, [routeEnd]);

  const [lokasiLoaded, setLokasiLoaded] = useState(0);
  const toast = useToast();
  const { isAdmin } = useAuth();
  const loadMarkersRef = useRef(null);

  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setPageReady(true)));
  }, []);

  // Add location form state
  const [addModal, setAddModal] = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [addForm, setAddForm] = useState({
    provinsi_id: '', provinsi_nama: '',
    kabupaten_id: '', kabupaten_nama: '',
    kecamatan_id: '', kecamatan_nama: '',
    desa_id: '', desa_nama: '',
    kategori_id: '',
    nama_tempat: '', nama_pemilik: '', nomor_telepon: '',
    alamat: '', deskripsi: '', latitude: '', longitude: '', is_active: true,
  });
  const [addKategoris, setAddKategoris] = useState([]);
  const [addFotos, setAddFotos] = useState([]);
  const [addFotoPrev, setAddFotoPrev] = useState([]);
  const addFileRef = useRef(null);
  const addMapRef = useRef(null);
  const addMapObj = useRef(null);
  const [addDetecting, setAddDetecting] = useState(false);

  const openAddLocation = () => {
    setAddForm({
      provinsi_id: '', provinsi_nama: '', kabupaten_id: '', kabupaten_nama: '',
      kecamatan_id: '', kecamatan_nama: '', desa_id: '', desa_nama: '',
      kategori_id: '', nama_tempat: '', nama_pemilik: '', nomor_telepon: '',
      alamat: '', deskripsi: '', latitude: '', longitude: '', is_active: true,
    });
    setAddErrors({}); setAddFotos([]); setAddFotoPrev([]);
    setLocationPicked(true); setAddModal(true);
  };

  const setAdd = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAddForm(f => ({ ...f, [k]: val }));
  };

  const handleAddDetectLocation = () => {
    if (!navigator.geolocation) { toast('Geolocation tidak didukung', 'error'); return; }
    setAddDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddForm(f => ({ ...f, latitude: latitude.toFixed(8), longitude: longitude.toFixed(8) }));
        try {
          const res = await wilayahApi.detectLocation({ latitude, longitude });
          const d = res.data.data;
          setAddForm(f => ({
            ...f, latitude: latitude.toFixed(8), longitude: longitude.toFixed(8),
            alamat: d.alamat || f.alamat,
          }));
        } catch {}
        setLocationPicked(true);
        setAddDetecting(false);
      },
      () => { toast('Gagal mendeteksi lokasi', 'error'); setAddDetecting(false); },
      { enableHighAccuracy: true }
    );
  };

  const handleAddFotoChange = (e) => {
    const files = Array.from(e.target.files);
    setAddFotos(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setAddFotoPrev(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleAddSave = async (e) => {
    e.preventDefault();
    setSaving(true); setAddErrors({});
    const fd = new FormData();
    Object.entries(addForm).forEach(([k, v]) => fd.append(k, v));
    fd.set('is_active', addForm.is_active ? '1' : '0');
    addFotos.forEach(f => fd.append('fotos[]', f));
    try {
      await lokasiApi.store(fd);
      toast('Lokasi berhasil ditambahkan');
      setAddModal(false);
      loadMarkersRef.current?.();
    } catch (err) {
      if (err.response?.data?.errors) setAddErrors(err.response.data.errors);
      else toast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSaving(false); }
  };

  // Init map in add modal
  useEffect(() => {
    if (!addModal) {
      if (addMapObj.current) { addMapObj.current.remove(); addMapObj.current = null; }
      return;
    }
    const container = addMapRef.current;
    if (!container) return;
    container.innerHTML = '';
    const lat = parseFloat(addForm.latitude) || -7.3274;
    const lng = parseFloat(addForm.longitude) || 108.3437;
    const map = L.map(container).setView([lat, lng], locationPicked ? 15 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    let marker = null;
    if (locationPicked && addForm.latitude && addForm.longitude) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', (e) => {
        const { lat: mlat, lng: mlng } = e.target.getLatLng();
        setAddForm(f => ({ ...f, latitude: mlat.toFixed(8), longitude: mlng.toFixed(8) }));
      });
    }
    if (!locationPicked) {
      map.on('click', (e) => {
        if (!marker) marker = L.marker(e.latlng).addTo(map);
        else marker.setLatLng(e.latlng);
        setAddForm(f => ({ ...f, latitude: e.latlng.lat.toFixed(8), longitude: e.latlng.lng.toFixed(8) }));
        setLocationPicked(true);
      });
    }
    addMapObj.current = map;
    return () => { map.remove(); addMapObj.current = null; };
  }, [addModal, locationPicked]);

  useEffect(() => {
    if (addModal) {
      kategoriApi.all().then(r => setAddKategoris(r.data.data));
    }
  }, [addModal]);

  // ── Filter handler ───────────────────
  const setF = (k) => (e) => {
    const val = e.target.value;
    const w = wilayaNama.current;
    if (k === 'provinsi_id') {
      const p = provinsis.find(x => String(x.id) === String(val));
      w.provinsi = p?.nama || ''; w.kabupaten = ''; w.kecamatan = ''; w.desa = '';
      setFilters(p => ({ ...p, provinsi_id: val, kabupaten_id: '', kecamatan_id: '', desa_id: '' }));
      if (val) wilayahApi.kabupaten(val).then(r => setKabupatens(r.data.data));
      else { setKabupatens([]); setKecamatans([]); setDesas([]); }
    } else if (k === 'kabupaten_id') {
      const kab = kabupatens.find(x => String(x.id) === String(val));
      w.kabupaten = kab?.nama || ''; w.kecamatan = ''; w.desa = '';
      setFilters(p => ({ ...p, kabupaten_id: val, kecamatan_id: '', desa_id: '' }));
      if (val) wilayahApi.kecamatan(val).then(r => setKecamatans(r.data.data));
      else { setKecamatans([]); setDesas([]); }
    } else if (k === 'kecamatan_id') {
      const kec = kecamatans.find(x => String(x.id) === String(val));
      w.kecamatan = kec?.nama || ''; w.desa = '';
      setFilters(p => ({ ...p, kecamatan_id: val, desa_id: '' }));
      if (val) wilayahApi.desa(val).then(r => setDesas(r.data.data));
      else setDesas([]);
    } else if (k === 'desa_id') {
      const d = desas.find(x => String(x.id) === String(val));
      w.desa = d?.nama || '';
      setFilters(p => ({ ...p, desa_id: val }));
    } else {
      setFilters(p => ({ ...p, [k]: val }));
    }
  };

  // ── Init map ─────────────────────────
  useEffect(() => {
    if (mapObj.current) return;
    mapObj.current = L.map(mapRef.current).setView([-7.3274, 108.3437], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapObj.current);
    mapObj.current.on('click', (e) => {
      if (routeModeRef.current) {
        if (!routeStartRef.current) {
          setRouteStart({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
          setRouteStep(2);
        } else if (!routeEndRef.current) {
          setRouteEnd({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
        }
        return;
      }
      setRadius(p => ({ ...p, lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) }));
    });
    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, []);

  // ── Load dropdowns ───────────────────
  useEffect(() => {
    wilayahApi.provinsi().then(r => setProvinsis(r.data.data));
    kategoriApi.all().then(r => setKategoris(r.data.data));
  }, []);

  // ── Search & navigate from query params ──
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
  }, []);

  useEffect(() => {
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const nama = searchParams.get('nama');
    if (!isNaN(lat) && !isNaN(lng) && mapObj.current) {
      setTimeout(() => {
        if (!mapObj.current) return;
        mapObj.current.flyTo([lat, lng], 16, { duration: 1.5 });
        L.popup({ closeButton: true, className: 'target-popup' })
          .setLatLng([lat, lng])
          .setContent(`<div class="text-sm font-semibold text-gray-800">${nama || 'Lokasi'}</div>`)
          .openOn(mapObj.current);
      }, 1500);
    }
  }, [searchParams, lokasiLoaded]);

  // ── Route function ───────────────────
  const drawRouteLine = useCallback((route, map) => {
    if (routeLineRef.current) { map.removeLayer(routeLineRef.current); routeLineRef.current = null; }
    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
    const routeGroup = L.layerGroup().addTo(map);
    L.polyline(coords, {
      color: '#FFFFFF', weight: 14, opacity: 0.35,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(routeGroup);
    L.polyline(coords, {
      color: '#3B82F6', weight: 8, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(routeGroup);
    routeLineRef.current = routeGroup;
    map.flyToBounds(L.latLngBounds(coords), { padding: [40, 40], duration: 1.2 });
    const km = (route.distance / 1000).toFixed(1);
    const min = Math.round(route.duration / 60);
    const h = Math.floor(min / 60);
    const m = min % 60;
    setRouteData({ distance: km, duration: h > 0 ? `${h}j ${m}m` : `${m} menit` });
  }, []);

  const fetchRoute = useCallback(async (targetLat, targetLng) => {
    const map = mapObj.current;
    if (!map) return;
    const getLocation = () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) { alert('Geolocation tidak didukung browser'); reject(); return; }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { alert('Aktifkan lokasi untuk fitur rute'); reject(); },
        { enableHighAccuracy: true }
      );
    });
    let loc = userLocation;
    if (!loc) {
      try { loc = await getLocation(); setUserLocation(loc); }
      catch { return; }
    }
    try {
      const res = await routingApi.getRoute(loc.lat, loc.lng, targetLat, targetLng);
      const data = res.data;
      if (!data.success || !data.data?.routes?.length) { alert('Rute tidak ditemukan'); return; }
      drawRouteLine(data.data.routes[0], map);
    } catch { alert('Gagal mengambil rute'); }
  }, [userLocation, drawRouteLine]);

  const handleShowDetail = useCallback((id) => {
    navigate(`/lokasi/${id}`);
  }, [navigate]);

  useEffect(() => {
    window.__showRoute = fetchRoute;
    return () => { delete window.__showRoute; };
  }, [fetchRoute]);

  // ── User location marker ─────────────
  useEffect(() => {
    if (!userLocation || !mapObj.current) return;
    if (userMarkerRef.current) { mapObj.current.removeLayer(userMarkerRef.current); }
    const icon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);"/>',
      className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(mapObj.current);
    userMarkerRef.current.bindPopup('Lokasi Saya');
    return () => { if (userMarkerRef.current) { mapObj.current.removeLayer(userMarkerRef.current); userMarkerRef.current = null; } };
  }, [userLocation]);

  // ── Nearest UMKM ─────────────────────
  const [nearestUmkms, setNearestUmkms] = useState([]);
  useEffect(() => {
    if (!userLocation || lokasisRef.current.length === 0) { setNearestUmkms([]); return; }
    const { lat, lng } = userLocation;
    const withDist = lokasisRef.current.map(l => {
      const d = Math.sqrt((l.latitude - lat) ** 2 + (l.longitude - lng) ** 2) * 111.32;
      return { ...l, jarak_km: d };
    }).sort((a, b) => a.jarak_km - b.jarak_km).slice(0, 5);
    setNearestUmkms(withDist);
  }, [userLocation, lokasiLoaded]);

  // ── Route mode markers ───────────────
  useEffect(() => {
    if (!mapObj.current) return;
    if (routeStartMarkerRef.current) { mapObj.current.removeLayer(routeStartMarkerRef.current); routeStartMarkerRef.current = null; }
    if (routeEndMarkerRef.current) { mapObj.current.removeLayer(routeEndMarkerRef.current); routeEndMarkerRef.current = null; }
    if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); routeLineRef.current = null; setRouteData(null); }

    if (!routeMode) { setRouteStep(0); setRouteStart(null); setRouteEnd(null); return; }

    if (routeStart) {
      const iconA = L.divIcon({
        html: '<div style="width:28px;height:28px;background:#3B82F6;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">A</div>',
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      });
      routeStartMarkerRef.current = L.marker([routeStart.lat, routeStart.lng], { icon: iconA }).addTo(mapObj.current);
    }
    if (routeEnd) {
      const iconB = L.divIcon({
        html: '<div style="width:28px;height:28px;background:#EF4444;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">B</div>',
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      });
      routeEndMarkerRef.current = L.marker([routeEnd.lat, routeEnd.lng], { icon: iconB }).addTo(mapObj.current);
      (async () => {
        try {
          const res = await routingApi.getRoute(routeStart.lat, routeStart.lng, routeEnd.lat, routeEnd.lng);
          const data = res.data;
          if (data.success && data.data?.routes?.length > 0) {
            const route = data.data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); }
            const routeGroup = L.layerGroup().addTo(mapObj.current);
            L.polyline(coords, {
              color: '#FFFFFF', weight: 14, opacity: 0.35,
              lineCap: 'round', lineJoin: 'round',
            }).addTo(routeGroup);
            L.polyline(coords, {
              color: '#8B5CF6', weight: 8, opacity: 1,
              lineCap: 'round', lineJoin: 'round',
            }).addTo(routeGroup);
            routeLineRef.current = routeGroup;
            mapObj.current.flyToBounds(L.latLngBounds(coords), { padding: [40, 40], duration: 1 });
            const km = (route.distance / 1000).toFixed(1);
            const min = Math.round(route.duration / 60);
            const h = Math.floor(min / 60);
            const m = min % 60;
            setRouteData({ distance: km, duration: h > 0 ? `${h}j ${m}m` : `${m} menit`, start: routeStart, end: routeEnd });
          }
        } catch {}
      })();
    }
  }, [routeMode, routeStart, routeEnd]);

  // ── Load & render markers ─────────────
  const loadMarkers = useCallback(async () => {
    if (!mapObj.current) return;
    setLoading(true);

    try {
      // Clear old layers
      if (layerRef.current) { mapObj.current.removeLayer(layerRef.current); layerRef.current = null; }
      if (heatRef.current)  { mapObj.current.removeLayer(heatRef.current); heatRef.current = null; }
      if (boundaryRef.current) { mapObj.current.removeLayer(boundaryRef.current); boundaryRef.current = null; }
      if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); routeLineRef.current = null; setRouteData(null); }

      const [res] = await Promise.all([
        lokasiApi.mapData({
          provinsi_id: filters.provinsi_id || undefined,
          kabupaten_id: filters.kabupaten_id || undefined,
          kecamatan_id: filters.kecamatan_id || undefined,
          desa_id:      filters.desa_id      || undefined,
          kategori_id:  filters.kategori_id  || undefined,
          nama:         searchTerm || undefined,
        }),
        // Pre-cache dynamic imports saat bersamaan dengan API call
        getCluster(),
        showHeat ? getHeat() : Promise.resolve(),
      ]);

      const lokasis = res.data.data;
      lokasisRef.current = lokasis;
      setLokasiLoaded(n => n + 1);
      setCount(lokasis.length);

      // Marker cluster (pakai cache, tidak re-import)
      let clusterGroup;
      if (clusterImport) {
        clusterGroup = L.markerClusterGroup({ maxClusterRadius: 50, chunkedLoading: true, chunkInterval: 100 });
      } else {
        clusterGroup = L.layerGroup();
      }

      // Batch marker creation dengan requestAnimationFrame untuk tidak block UI
      const markers = lokasis.map(item => {
        const fotoUrl = item.fotos?.[0]?.url || null;
        const marker = L.marker(
          [parseFloat(item.latitude), parseFloat(item.longitude)],
          { icon: categoryIcon(item.kategori?.warna, item.kategori?.ikon, fotoUrl) }
        );
        marker.bindPopup(popupHtml(item), { maxWidth: 320, className: 'custom-popup' });
        return marker;
      });

      // Tambah marker dalam batch
      if (markers.length > 500 && clusterImport) {
        const chunkSize = 200;
        for (let i = 0; i < markers.length; i += chunkSize) {
          clusterGroup.addLayers(markers.slice(i, i + chunkSize));
          await new Promise(r => requestAnimationFrame(r));
        }
      } else {
        markers.forEach(m => clusterGroup.addLayer(m));
      }

      mapObj.current.addLayer(clusterGroup);
      layerRef.current = clusterGroup;

      // Heatmap
      if (showHeat && heatImport && lokasis.length > 0) {
        const heatData = lokasis.map(l => [parseFloat(l.latitude), parseFloat(l.longitude), 0.8]);
        heatRef.current = L.heatLayer(heatData, { radius: 30, blur: 20, maxZoom: 17, gradient: { 0.4:'blue', 0.65:'lime', 1:'red' } });
        mapObj.current.addLayer(heatRef.current);
      }

      // Region boundaries (kabupaten/kecamatan/desa)
      if (!filters.provinsi_id && !filters.kabupaten_id && !filters.kecamatan_id && !filters.desa_id) {
        drawRegionBoundaries(mapObj.current, lokasis, regionRef);
      }

      // Geocode + boundary
      const w = wilayaNama.current;
      if (filters.provinsi_id && (w.provinsi || w.kabupaten || w.kecamatan || w.desa)) {
        try {
          const geoRes = await wilayahApi.geocode({
            provinsi: w.provinsi || undefined,
            kabupaten: w.kabupaten || undefined,
            kecamatan: w.kecamatan || undefined,
            desa: w.desa || undefined,
          });
          const geo = geoRes.data.data;
          if (geo) {
            const zoom = w.desa ? 15 : w.kecamatan ? 13 : w.kabupaten ? 11 : 9;
            if (geo.boundingbox) {
              const [s, n, w2, e] = geo.boundingbox.map(Number);
              mapObj.current.flyToBounds([[s, w2], [n, e]], {
                padding: [40, 40], maxZoom: zoom, duration: 1.2,
              });
            } else if (geo.lat && geo.lon) {
              mapObj.current.flyTo([parseFloat(geo.lat), parseFloat(geo.lon)], zoom, { duration: 1.5 });
            }
            const colors = { provinsi: '#3B82F6', kabupaten: '#10B981', kecamatan: '#F59E0B', desa: '#8B5CF6' };
            const level = w.desa ? 'desa' : w.kecamatan ? 'kecamatan' : w.kabupaten ? 'kabupaten' : 'provinsi';
            const color = colors[level];
            if (geo.geojson) {
              boundaryRef.current = L.geoJSON(geo.geojson, {
                style: { color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.12 },
              }).addTo(mapObj.current);
            } else if (geo.boundingbox) {
              const [s, n, w2, e] = geo.boundingbox.map(Number);
              boundaryRef.current = L.rectangle([[s, w2], [n, e]], {
                color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.12,
              }).addTo(mapObj.current);
            }
            if (!boundaryRef.current && geo.lat && geo.lon) {
              mapObj.current.flyTo([parseFloat(geo.lat), parseFloat(geo.lon)], zoom, { duration: 1.5 });
            }
          }
        } catch {}
      }
      if (!boundaryRef.current && lokasis.length > 0) {
        const bounds = lokasis.map(l => [parseFloat(l.latitude), parseFloat(l.longitude)]);
        mapObj.current.flyToBounds(bounds, { padding: [40, 40], maxZoom: 15, duration: 1.2 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, showHeat, searchTerm]);

  // Sync loadMarkers ke ref
  useEffect(() => { loadMarkersRef.current = loadMarkers; }, [loadMarkers]);

  // ── Auto-trigger ─────────────────────
  // First load langsung tanpa debounce, selanjutnya pakai debounce
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      loadMarkers();
    } else {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => loadMarkers(), 400);
    }
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [filters, showHeat, searchTerm]);

  // ── Radius search ────────────────────
  const handleRadiusSearch = async () => {
    if (!radius.lat || !radius.lng || !radius.km) return;
    try {
      const res = await lokasiApi.radiusSearch({ latitude: radius.lat, longitude: radius.lng, radius: radius.km });
      const lokasis = res.data.data;
      if (radiusRef.current) mapObj.current.removeLayer(radiusRef.current);
      const circle = L.circle([radius.lat, radius.lng], {
        radius: radius.km * 1000,
        color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1,
      }).addTo(mapObj.current);
      radiusRef.current = circle;
      if (layerRef.current) mapObj.current.removeLayer(layerRef.current);
      const group = L.layerGroup();
      lokasis.forEach(item => {
        const marker = L.marker([parseFloat(item.latitude), parseFloat(item.longitude)], { icon: categoryIcon(item.kategori?.warna, item.kategori?.ikon) });
        marker.bindPopup(popupHtml(item), { maxWidth: 320 });
        group.addLayer(marker);
      });
      group.addTo(mapObj.current);
      layerRef.current = group;
      mapObj.current.flyToBounds(circle.getBounds(), { padding: [20,20], duration: 1.2 });
      setCount(lokasis.length);
    } catch {}
  };

  const clearRadius = () => {
    if (radiusRef.current) { mapObj.current.removeLayer(radiusRef.current); radiusRef.current = null; }
    setRadius({ lat:'', lng:'', km:'' });
    loadMarkers();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation tidak didukung browser'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapObj.current) {
          mapObj.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
        }
      },
      () => alert('Gagal mendapatkan lokasi. Izinkan akses lokasi.'),
      { enableHighAccuracy: true }
    );
  };

  const clearRoute = () => {
    if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); routeLineRef.current = null; }
    setRouteData(null);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 relative">
      {/* Mobile backdrop */}
      {mobilePanelOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobilePanelOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div className={`
        ${mobilePanelOpen ? 'fixed left-0 top-0 z-40 h-full bg-white shadow-2xl' : 'hidden'}
        lg:relative lg:flex lg:w-72 lg:flex-shrink-0 lg:bg-transparent lg:shadow-none lg:h-auto lg:z-auto
        flex-col overflow-y-auto
        ${pageReady ? 'anim-fade-up-1' : 'opacity-0'}
      `}
        style={mobilePanelOpen ? { width: '18rem', maxWidth: '85vw' } : {}}
      >
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm text-gray-800">Panel Peta</span>
          <button onClick={() => setMobilePanelOpen(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4 lg:p-0">
          <button onClick={openAddLocation}
            className="card p-3.5 flex items-center gap-3 hover:bg-white transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-gray-800">Tambah Lokasi</p>
              <p className="text-[10px] text-gray-400 font-medium">Tambahkan UMKM baru</p>
            </div>
          </button>

          <FilterPanel
            filterOpen={filterOpen} setFilterOpen={setFilterOpen}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            filters={filters} setF={setF}
            provinsis={provinsis} kabupatens={kabupatens} kecamatans={kecamatans} desas={desas} kategoris={kategoris}
            showHeat={showHeat} setShowHeat={setShowHeat}
            loading={loading} loadMarkers={loadMarkers}
          />

          <LocationCard
            userLocation={userLocation} handleGetLocation={handleGetLocation}
            clearRoute={clearRoute} routeLineRef={routeLineRef}
          />

          <RouteCard
            routeMode={routeMode} setRouteMode={setRouteMode}
            routeStep={routeStep} setRouteStep={setRouteStep}
            routeStart={routeStart} setRouteStart={setRouteStart}
            routeEnd={routeEnd} setRouteEnd={setRouteEnd}
            routeData={routeData} setRouteData={setRouteData}
            clearRoute={clearRoute} routeLineRef={routeLineRef}
          />

          <RouteInfoCard routeData={routeData} clearRoute={clearRoute} />

          <RadiusCard
            radius={radius} setRadius={setRadius}
            handleRadiusSearch={handleRadiusSearch} clearRadius={clearRadius} radiusRef={radiusRef}
          />

          <NearestUmkmCard nearestUmkms={nearestUmkms} onDetail={handleShowDetail} />

          <LegendCard kategoris={kategoris} />

          <StatsCard loading={loading} count={count} />

          {/* Share public map */}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="card p-3 flex items-center gap-3 hover:bg-white transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Bagikan Peta Publik</p>
              <p className="text-[10px] text-gray-400 font-medium">Tanpa login, seperti Google Maps</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-gray-500 transition-colors">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Map */}
      <div className={`flex-1 relative ${pageReady ? 'anim-fade-up-2' : 'opacity-0'}`}>
        {loading && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
              Memuat peta...
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden border border-white/60"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Mobile FAB */}
      <button onClick={() => setMobilePanelOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-2xl bg-white shadow-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
        title="Buka Panel"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.04)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      </button>

      {/* Add Location Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Tambah Lokasi" size="xl">
        <form onSubmit={handleAddSave} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">
              <div>
                <label className="label">Nama Tempat <span className="text-red-500">*</span></label>
                <input className={`input ${addErrors.nama_tempat ? 'border-red-300' : ''}`}
                  placeholder="Warung Bu Sari" value={addForm.nama_tempat} onChange={setAdd('nama_tempat')} required />
                {addErrors.nama_tempat && <p className="text-xs text-red-500 mt-1">{addErrors.nama_tempat[0]}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nama Pemilik</label>
                  <input className="input" placeholder="Nama pemilik" value={addForm.nama_pemilik} onChange={setAdd('nama_pemilik')} />
                </div>
                <div>
                  <label className="label">Nomor Telepon</label>
                  <input className="input" placeholder="08xx" value={addForm.nomor_telepon} onChange={setAdd('nomor_telepon')} />
                </div>
              </div>
              <div>
                <label className="label">Kategori <span className="text-red-500">*</span></label>
                <select className={`input ${addErrors.kategori_id ? 'border-red-300' : ''}`}
                  value={addForm.kategori_id} onChange={setAdd('kategori_id')} required>
                  <option value="">Pilih Kategori</option>
                  {addKategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Alamat <span className="text-red-500">*</span></label>
                <textarea className={`input resize-none min-h-[70px] ${addErrors.alamat ? 'border-red-300' : ''}`}
                  placeholder="Jl. Raya No. 1, RT 01, RW 02..." value={addForm.alamat} onChange={setAdd('alamat')} required />
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <RichTextEditor value={addForm.deskripsi} onChange={v => setAdd('deskripsi')({ target: { value: v } })} minH="150px" />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Koordinat GPS <span className="text-red-500">*</span></label>
                  <button type="button" onClick={handleAddDetectLocation} disabled={addDetecting}
                    className="btn-secondary btn-sm text-xs">
                    <Crosshair size={12} className={addDetecting ? 'animate-spin' : ''} /> Lokasi Terkini
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input className={`input font-mono text-xs ${addErrors.latitude ? 'border-red-300' : ''}`}
                      placeholder="Latitude" value={addForm.latitude} onChange={setAdd('latitude')} required />
                  </div>
                  <div>
                    <input className={`input font-mono text-xs ${addErrors.longitude ? 'border-red-300' : ''}`}
                      placeholder="Longitude" value={addForm.longitude} onChange={setAdd('longitude')} required />
                  </div>
                </div>
              </div>
              <div ref={addMapRef} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }} />
              <p className="text-[11px] text-gray-400 text-center -mt-2">
                {addForm.latitude && addForm.longitude ? 'Marker bisa digeser' : 'Klik peta untuk memilih titik'}
              </p>
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Foto Lokasi</h4>
                {addFotoPrev.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {addFotoPrev.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={() => { setAddFotos(f => f.filter((_, idx) => idx !== i)); setAddFotoPrev(p => p.filter((_, idx) => idx !== i)); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => addFileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-emerald-300 hover:text-emerald-500 transition-all w-full justify-center">
                  <ImageIcon size={14} /> Upload Foto
                </button>
                <input ref={addFileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleAddFotoChange} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-emerald-600"
                  checked={addForm.is_active} onChange={setAdd('is_active')} />
                <span className="text-sm text-gray-700">Lokasi Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Tambah Lokasi'}
            </button>
          </div>
        </form>
      </Modal>


    </div>
  );
}
