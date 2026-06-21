import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { lokasiApi, kategoriApi, wilayahApi, routingApi } from '../../api';
import { Search, Filter, Layers, LocateFixed, ChevronDown, ChevronUp, X, Globe, MapPin, Phone, Route, Navigation, Clock, ArrowRight, Play, LogOut, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import logoCianjur from '../../assets/logo_cianjur.png';
import { useAuth } from '../../contexts/AuthContext';
import iconPaths from '../../utils/iconPaths';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

let clusterImport = null;
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
    className: '', iconSize: [24, h], iconAnchor: [12, h], popupAnchor: [0, -h],
  });
}

function popupHtml(item) {
  const fotos = item.fotos || [];
  const imgHtml = fotos.length > 0
    ? `<img src="${fotos[0].url}" class="w-full h-36 object-cover rounded-t-xl" />`
    : '';
  return `
    <div class="w-72">
      ${imgHtml}
      <div class="p-4">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-bold text-gray-900 text-base leading-snug">${item.nama_tempat}</h3>
          ${item.kategori ? `<span class="text-xs px-2.5 py-0.5 rounded-full text-white font-semibold flex-shrink-0" style="background:${item.kategori.warna||'#6B7280'}">${item.kategori.nama}</span>` : ''}
        </div>
        ${item.alamat ? `<p class="text-sm text-gray-500 mb-3">${item.alamat}</p>` : ''}
        <div class="space-y-1.5 text-sm text-gray-600">
          ${item.nama_pemilik ? `<div class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${item.nama_pemilik}</div>` : ''}
          ${item.nomor_telepon ? (() => { const wa = item.nomor_telepon.replace(/^0+/, '62').replace(/[^0-9]/g, ''); return `<div class="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <a href="tel:${item.nomor_telepon}" class="text-blue-600 hover:underline flex-1">${item.nomor_telepon}</a><a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors" title="Chat WhatsApp"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a></div>`; })() : ''}
          ${item.kecamatan_nama || item.kecamatan?.nama ? `<div class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${item.kecamatan_nama || item.kecamatan?.nama}${item.desa_nama || item.desa?.nama ? `, ${item.desa_nama || item.desa?.nama}` : ''}</div>` : ''}
        </div>
        <div class="mt-3 text-center">
          <a href="/lokasi/${item.id}"
            class="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Lihat detail</a>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <button onclick="window.__routeTo(${item.latitude}, ${item.longitude}, '${item.nama_tempat.replace(/'/g, "\\'")}')"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
            style="background: linear-gradient(135deg, #059669, #10B981);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 6 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            Rute ke sini
          </button>
          <a href="https://www.google.com/maps?q=${item.latitude},${item.longitude}" target="_blank" rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Buka di Google Maps
          </a>
        </div>
      </div>
    </div>
  `;
}

function getStepIcon(type, modifier) {
  const size = 16, color = 'currentColor', sw = 2;
  if (type === 'depart') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
  if (type === 'arrive') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/></svg>`;
  if (type === 'roundabout') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 4v8"/><path d="M12 12 8 8"/></svg>`;
  if (type === 'end of road' || type === 'turn') {
    if (modifier?.includes('left')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h14"/><path d="M21 12h-2"/><path d="M17 8l4 4-4 4"/></svg>`;
    if (modifier?.includes('right')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12H7"/><path d="M3 12h2"/><path d="M7 8l-4 4 4 4"/></svg>`;
    if (modifier === 'straight' || !modifier) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/></svg>`;
    if (modifier?.includes('slight')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 15 5"/><path d="M3 9v8h8"/></svg>`;
  }
  if (type === 'continue' || type === 'new name') {
    if (modifier === 'straight' || !modifier) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/></svg>`;
    if (modifier?.includes('left')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h14"/><path d="M21 12h-2"/><path d="M17 8l4 4-4 4"/></svg>`;
    if (modifier?.includes('right')) return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12H7"/><path d="M3 12h2"/><path d="M7 8l-4 4 4 4"/></svg>`;
  }
  if (type === 'fork') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M12 11c2-2 6-4 8-4"/><path d="M12 11c-2-2-6-4-8-4"/></svg>`;
  if (type === 'merge') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V3"/><path d="M12 13c-2-2-6-4-8-4"/><path d="M12 13c2-2 6-4 8-4"/></svg>`;
  if (type === 'ramp') return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11c-3 0-6 2-9 6-3-4-6-6-9-6"/></svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/></svg>`;
}

function getStepText(step, i, steps) {
  const { name, maneuver, distance } = step;
  const { type, modifier } = maneuver;
  const d = (distance / 1000).toFixed(1);
  const dm = distance < 1000 ? `${Math.round(distance)} m` : `${d} km`;

  if (type === 'depart') {
    const dir = name ? `arah ${name}` : '';
    return `Mulai ${dir} — ${dm}`;
  }
  if (type === 'arrive') return 'Sampai di tujuan';
  if (type === 'roundabout') {
    const exit = modifier ? ` ambil ${modifier}` : '';
    return `Masuki bundaran,${exit} — ${dm}`;
  }
  if (type === 'end of road') {
    const dir = modifier ? ` ${modifier === 'left' ? 'kiri' : modifier === 'right' ? 'kanan' : modifier}` : '';
    const road = name ? ` ke ${name}` : '';
    return `Di ujung jalan, belok${dir}${road} — ${dm}`;
  }

  const dirMap = { 'left':'kiri','right':'kanan','straight':'lurus','slight left':'agak kiri','slight right':'agak kanan','sharp left':'tajam kiri','sharp right':'tajam kanan' };
  const typeMap = { 'turn':'Belok','continue':'Terus','merge':'Bergabung','fork':'Ambil jalur','ramp':'Masuki','new name':'Lanjut ke' };

  const dir = dirMap[modifier] || modifier || '';
  const typeText = typeMap[type] || '';
  const road = name ? ` ${name}` : '';

  if (type === 'continue' && modifier === 'straight') return `Terus lurus${road} — ${dm}`;
  if (type === 'continue' && modifier === undefined) return `Terus lurus${road} — ${dm}`;

  return `${typeText} ${dir}${road} — ${dm}`.trim();
}

function getStepShort(step) {
  const { name, maneuver, distance } = step;
  const { type, modifier } = maneuver;

  if (type === 'depart') return { text: name ? `Arah ${name}` : 'Mulai', road: name || '' };
  if (type === 'arrive') return { text: 'Sampai di tujuan', road: name || '' };

  const dirMap = { 'left':'kiri','right':'kanan','straight':'lurus','slight left':'agak kiri','slight right':'agak kanan','sharp left':'tajam kiri','sharp right':'tajam kanan' };
  const typeMap = { 'turn':'Belok','continue':'Terus','merge':'Gabung','fork':'Ambil','ramp':'Masuk','new name':'Lanjut','end of road':'Belok','roundabout':'Bundaran' };

  const dir = dirMap[modifier] || '';
  const typeText = typeMap[type] || '';
  let text = type === 'roundabout' ? `Putaran ${modifier||''}` : `${typeText} ${dir}`;
  return { text: text.trim(), road: name || '' };
}

function getNavInstruction(step) {
  if (!step) return { icon: '', text: '', road: '' };
  const short = getStepShort(step);
  const iconHtml = getStepIcon(step.maneuver.type, step.maneuver.modifier);
  return { icon: iconHtml, text: short.text, road: short.road };
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function drawRegionBoundaries(map, lokasis, regionRef) {
  if (regionRef.current) {
    regionRef.current.forEach(l => map.removeLayer(l));
  }
  const layers = [];
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Collect unique kabupaten with province context for accurate geocoding
  const kabMap = {};
  lokasis.forEach(l => {
    if (l.kabupaten_nama) {
      const key = l.kabupaten_nama + '||' + (l.provinsi_nama || '');
      if (!kabMap[key]) {
        kabMap[key] = { kab: l.kabupaten_nama, prov: l.provinsi_nama || '' };
      }
    }
  });

  let drawn = 0;
  for (const item of Object.values(kabMap)) {
    if (drawn >= 2) break; // max 2 boundaries to avoid clutter
    try {
      const params = { kabupaten: item.kab };
      if (item.prov) params.provinsi = item.prov;
      const res = await wilayahApi.geocode(params);
      const geo = res.data.data;
      if (geo?.geojson) {
        layers.push(L.geoJSON(geo.geojson, {
          style: { color: '#3B82F6', weight: 2, opacity: 0.5, fillColor: '#3B82F6', fillOpacity: 0.06 }
        }).addTo(map));
        drawn++;
      } else if (geo?.boundingbox) {
        const [s, n, w, e] = geo.boundingbox.map(Number);
        layers.push(L.rectangle([[s, w], [n, e]], {
          color: '#3B82F6', weight: 2, opacity: 0.5, fillColor: '#3B82F6', fillOpacity: 0.06
        }).addTo(map));
        drawn++;
      }
    } catch {}
    await delay(300);
  }

  regionRef.current = layers;
}

export default function PublicPetaPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const layerRef = useRef(null);
  const boundaryRef = useRef(null);
  const regionRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const routeDestMarkerRef = useRef(null);
  const autoTimer = useRef(null);
  const wilayaNama = useRef({ provinsi:'', kabupaten:'', kecamatan:'', desa:'' });
  const routeFnRef = useRef(null);
  const routeTargetRef = useRef(null);
  const watchIdRef = useRef(null);
  const navStateRef = useRef({ steps: [], currentIdx: 0 });

  const [pageReady, setPageReady] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setPageReady(true)));
  }, []);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinsis, setProvinsis] = useState([]);
  const [kabupatens, setKabupatens] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [desas, setDesas] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [filters, setFilters] = useState({ provinsi_id:'', kabupaten_id:'', kecamatan_id:'', desa_id:'', kategori_id:'' });
  const [count, setCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [panelState, setPanelState] = useState('hidden'); // hidden | entering | visible | leaving
  useEffect(() => {
    if (showResults && results.length > 0) {
      setPanelState('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelState('visible')));
    } else if (panelState !== 'hidden') {
      setPanelState('leaving');
      const t = setTimeout(() => setPanelState('hidden'), 250);
      return () => clearTimeout(t);
    }
  }, [showResults, results.length]);
  const panelClass = panelState === 'entering' ? 'animate-panel-in' : panelState === 'leaving' ? 'animate-panel-out' : '';
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  // Route state
  const [routeActive, setRouteActive] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [routeMode, setRouteMode] = useState('driving');

  // Navigation state
  const [navigationActive, setNavigationActive] = useState(false);
  const [navStepIdx, setNavStepIdx] = useState(0);
  const [navRemaining, setNavRemaining] = useState({ distance: 0, duration: 0 });

  // ── Init map ─────────────────────────
  useEffect(() => {
    if (mapObj.current) return;
    mapObj.current = L.map(mapRef.current, { zoomControl: false })
      .setView([-7.3274, 108.3437], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapObj.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapObj.current);
    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);

  // ── Load dropdowns ───────────────────
  useEffect(() => {
    wilayahApi.provinsi().then(r => setProvinsis(r.data.data));
    kategoriApi.all().then(r => setKategoris(r.data.data));
  }, []);

  // ── Route handler ────────────────────
  const handleRouteTo = useCallback(async (targetLat, targetLng, targetName) => {
    if (!mapObj.current) return;
    routeTargetRef.current = { lat: targetLat, lng: targetLng, name: targetName };

    if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); routeLineRef.current = null; }
    if (routeDestMarkerRef.current) { mapObj.current.removeLayer(routeDestMarkerRef.current); routeDestMarkerRef.current = null; }

    if (!userLocation) {
      if (!navigator.geolocation) { alert('Browser tidak mendukung geolokasi'); return; }
      setLocating(true);
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        if (userMarkerRef.current) mapObj.current.removeLayer(userMarkerRef.current);
        const icon = L.divIcon({
          html: '<div style="width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.5);"/>',
          className: '', iconSize: [18, 18], iconAnchor: [9, 9],
        });
        userMarkerRef.current = L.marker([lat, lng], { icon }).addTo(mapObj.current);
        userMarkerRef.current.bindPopup('Lokasi Anda');

        setLocating(false);
        doRoute(lat, lng, targetLat, targetLng, targetName, routeMode);
      } catch {
        setLocating(false);
        alert('Gagal mendapatkan lokasi. Izinkan akses lokasi dan coba lagi.');
      }
      return;
    }

    doRoute(userLocation.lat, userLocation.lng, targetLat, targetLng, targetName, routeMode);
  }, [userLocation, routeMode]);

  const speedFactor = { driving: 1, motorcycle: 0.75, walking: 1 };
  const profileMap = { driving:'driving', motorcycle:'driving', walking:'walking' };
  const modeColors = { driving:'#059669', motorcycle:'#8B5CF6', walking:'#F59E0B' };
  const modeLabels = { driving:'Mobil', motorcycle:'Motor', walking:'Jalan Kaki' };

  const doRoute = async (fromLat, fromLng, toLat, toLng, toName, mode) => {
    if (!mapObj.current) return;
    setRouteLoading(true);
    const profile = profileMap[mode] || 'driving';
    const color = modeColors[mode] || '#059669';

    try {
      const res = await routingApi.getRoute(fromLat, fromLng, toLat, toLng);
      const data = res.data;

      if (!data.success || !data.data?.routes?.length) {
        alert('Rute tidak ditemukan');
        setRouteLoading(false);
        return;
      }

      const osrmData = data.data;

      const route = osrmData.routes[0];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

      const weight = mode === 'walking' ? 10 : 14;
      const routeGroup = L.layerGroup().addTo(mapObj.current);
      // Glow layer (outer border for visibility)
      L.polyline(coords, {
        color: mode === 'walking' ? '#FCD34D' : '#FFFFFF',
        weight: weight + 10,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);
      // Main route line
      L.polyline(coords, {
        color,
        weight,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeGroup);
      routeLineRef.current = routeGroup;

      const destIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;background:${color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.25);">B</div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16],
      });
      routeDestMarkerRef.current = L.marker([toLat, toLng], { icon: destIcon }).addTo(mapObj.current);

      const allCoords = [[fromLat, fromLng], ...coords];
      mapObj.current.flyToBounds(L.latLngBounds(allCoords), { padding: [60, 60], duration: 1.2 });

      const sf = speedFactor[mode] || 1;
      const km = (route.distance / 1000).toFixed(1);
      const rawMin = route.duration / 60;
      const min = Math.round(rawMin * sf);
      const h = Math.floor(min / 60);
      const m = min % 60;
      const timeStr = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;

      const steps = route.legs?.[0]?.steps || [];
      setRouteSteps(steps);
      setShowSteps(false);

      // Store cumulative distances for nav tracking
      let cumDist = 0;
      const stepsWithCum = steps.map(s => {
        cumDist += s.distance;
        return { ...s, cumDistance: cumDist, duration: Math.round(s.duration * sf) };
      });
      navStateRef.current = { steps: stepsWithCum, currentIdx: 0 };

      setRouteInfo({ distance: km, duration: timeStr, destination: toName });
      setRouteActive(true);
    } catch {
      alert('Gagal mengambil rute. Coba lagi.');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setRouteMode(newMode);
    if (routeActive && routeTargetRef.current && userLocation) {
      const t = routeTargetRef.current;
      doRoute(userLocation.lat, userLocation.lng, t.lat, t.lng, t.name, newMode);
    }
  };

  // ── Navigation ───────────────────────
  const handlePositionUpdate = useCallback((pos) => {
    const { latitude, longitude } = pos.coords;
    const state = navStateRef.current;
    if (!state.steps.length) return;

    // Update user marker position
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
    }

    // Auto-center map on user
    if (mapObj.current) {
      mapObj.current.panTo([latitude, longitude], { animate: true, duration: 0.3 });
    }

    // Check proximity to next maneuver points
    for (let i = state.currentIdx + 1; i < state.steps.length; i++) {
      const step = state.steps[i];
      const [mLng, mLat] = step.maneuver.location;
      const dist = getDistance(latitude, longitude, mLat, mLng);
      if (dist < 40) {
        state.currentIdx = i;
        setNavStepIdx(i);
        break;
      }
    }

    // Calculate remaining distance/duration
    const currentStep = state.steps[state.currentIdx] || state.steps[0];
    const remainingDist = currentStep.cumDistance
      ? state.steps[state.steps.length - 1].cumDistance - currentStep.cumDistance
      : 0;
    const ratio = state.steps[state.steps.length - 1].cumDistance > 0
      ? currentStep.cumDistance / state.steps[state.steps.length - 1].cumDistance
      : 0;
    const totalDuration = state.steps.reduce((sum, s) => sum + s.duration, 0);
    const remainingDuration = totalDuration * (1 - ratio);

    setNavRemaining({
      distance: Math.max(0, remainingDist),
      duration: Math.max(0, Math.round(remainingDuration)),
    });
  }, []);

  const startNavigation = () => {
    setNavigationActive(true);
    setNavStepIdx(0);
    const totalDist = navStateRef.current.steps.reduce((s, st) => s + st.distance, 0);
    setNavRemaining({ distance: totalDist, duration: 0 });

    // Hide route panel, clear other UI
    if (mapObj.current && routeLineRef.current) {
      mapObj.current.setView([userLocation.lat, userLocation.lng], 17, { animate: true, duration: 0.5 });
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    );
  };

  const stopNavigation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavigationActive(false);
    setNavStepIdx(0);
    navStateRef.current = { steps: [], currentIdx: 0 };
  };

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Expose route function globally for popup buttons
  useEffect(() => {
    routeFnRef.current = handleRouteTo;
    window.__routeTo = (lat, lng, name) => routeFnRef.current?.(lat, lng, name);
    return () => { delete window.__routeTo; };
  }, [handleRouteTo]);

  // Clear route
  const clearRoute = () => {
    if (!mapObj.current) return;
    if (routeLineRef.current) { mapObj.current.removeLayer(routeLineRef.current); routeLineRef.current = null; }
    if (routeDestMarkerRef.current) { mapObj.current.removeLayer(routeDestMarkerRef.current); routeDestMarkerRef.current = null; }
    setRouteActive(false);
    setRouteInfo(null);
    setRouteSteps([]);
    setShowSteps(false);
    navStateRef.current = { steps: [], currentIdx: 0 };
  };

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

  // ── Auto-detect region/category from search term ──
  const detectSearch = useCallback((term) => {
    const result = { provinsi_id: undefined, kabupaten_id: undefined, kecamatan_id: undefined, desa_id: undefined, kategori_id: undefined, detected: '' };
    if (!term || !term.trim()) return result;
    const t = term.trim().toUpperCase();

    const p = provinsis.find(x => x.nama.toUpperCase() === t);
    if (p) { result.provinsi_id = p.id; result.detected = 'provinsi'; return result; }

    const k = kategoris.find(x => x.nama.toUpperCase() === t);
    if (k) { result.kategori_id = String(k.id); result.detected = 'kategori'; return result; }

    const kab = kabupatens.find(x => x.nama.toUpperCase() === t);
    if (kab) { result.kabupaten_id = kab.id; result.detected = 'kabupaten'; return result; }

    const kec = kecamatans.find(x => x.nama.toUpperCase() === t);
    if (kec) { result.kecamatan_id = kec.id; result.detected = 'kecamatan'; return result; }

    const d = desas.find(x => x.nama.toUpperCase() === t);
    if (d) { result.desa_id = d.id; result.detected = 'desa'; return result; }

    return result;
  }, [provinsis, kabupatens, kecamatans, desas, kategoris]);

  // ── Load markers ─────────────────────
  const loadData = useCallback(async () => {
    if (!mapObj.current) return;
    setLoading(true);
    try {
      if (layerRef.current) { mapObj.current.removeLayer(layerRef.current); layerRef.current = null; }
      if (boundaryRef.current) { mapObj.current.removeLayer(boundaryRef.current); boundaryRef.current = null; }

      const detected = detectSearch(searchTerm);
      const params = {
        provinsi_id: filters.provinsi_id || detected.provinsi_id || undefined,
        kabupaten_id: filters.kabupaten_id || detected.kabupaten_id || undefined,
        kecamatan_id: filters.kecamatan_id || detected.kecamatan_id || undefined,
        desa_id: filters.desa_id || detected.desa_id || undefined,
        kategori_id: filters.kategori_id || detected.kategori_id || undefined,
        nama: searchTerm || undefined,
      };

      const res = await lokasiApi.mapData(params);

      const lokasis = res.data.data;
      setCount(lokasis.length);
      setResults(lokasis);
      const hasActiveSearch = searchTerm?.trim() || filters?.kategori_id;
      setShowResults(hasActiveSearch ? true : false);
      const catCounts = {};
      lokasis.forEach(l => {
        const id = l.kategori?.id || 'unknown';
        catCounts[id] = (catCounts[id] || 0) + 1;
      });
      setCategoryCounts(catCounts);
      await getCluster();

      let group;
      if (clusterImport) {
        group = L.markerClusterGroup({ maxClusterRadius: 50, chunkedLoading: true, chunkInterval: 100 });
      } else {
        group = L.layerGroup();
      }

      lokasis.forEach(item => {
        const fotoUrl = item.fotos?.[0]?.url || null;
        const marker = L.marker(
          [parseFloat(item.latitude), parseFloat(item.longitude)],
          { icon: categoryIcon(item.kategori?.warna, item.kategori?.ikon, fotoUrl) }
        );
        marker.bindPopup(popupHtml(item), { maxWidth: 320, className: 'public-popup' });
        group.addLayer(marker);
      });

      mapObj.current.addLayer(group);
      layerRef.current = group;

      const hasRegionFilter = filters.provinsi_id || filters.kabupaten_id || filters.kecamatan_id || filters.desa_id;
      const hasDetectedRegion = detected.provinsi_id || detected.kabupaten_id || detected.kecamatan_id || detected.desa_id;
      if (!hasRegionFilter && !hasDetectedRegion && !searchTerm?.trim()) {
        const uniqueKab = new Set(lokasis.map(l => l.kabupaten_nama).filter(Boolean));
        if (uniqueKab.size > 0 && uniqueKab.size <= 2) {
          drawRegionBoundaries(mapObj.current, lokasis, regionRef);
        }
      }

      // Geocode & boundary: from filter OR auto-detected region OR search term
      const geocodeTarget = filters.provinsi_id
        ? { provinsi: wilayaNama.current.provinsi, kabupaten: wilayaNama.current.kabupaten, kecamatan: wilayaNama.current.kecamatan, desa: wilayaNama.current.desa, detected: false }
        : detected.detected
          ? { provinsi: detected.provinsi_id ? (provinsis.find(x => String(x.id) === String(detected.provinsi_id))?.nama || '') : '',
              kabupaten: detected.kabupaten_id ? (kabupatens.find(x => String(x.id) === String(detected.kabupaten_id))?.nama || '') : '',
              kecamatan: detected.kecamatan_id ? (kecamatans.find(x => String(x.id) === String(detected.kecamatan_id))?.nama || '') : '',
              desa: detected.desa_id ? (desas.find(x => String(x.id) === String(detected.desa_id))?.nama || '') : '',
              detected: true }
          : null;

      const didGeocode = geocodeTarget && (geocodeTarget.provinsi || geocodeTarget.kabupaten || geocodeTarget.kecamatan || geocodeTarget.desa);
      if (didGeocode) {
        try {
          const geoRes = await wilayahApi.geocode({
            provinsi: geocodeTarget.provinsi || undefined,
            kabupaten: geocodeTarget.kabupaten || undefined,
            kecamatan: geocodeTarget.kecamatan || undefined,
            desa: geocodeTarget.desa || undefined,
          });
          const geo = geoRes.data.data;
          if (geo) {
            const zoom = geocodeTarget.desa ? 15 : geocodeTarget.kecamatan ? 13 : geocodeTarget.kabupaten ? 11 : 9;
            const color = geocodeTarget.desa ? '#8B5CF6' : geocodeTarget.kecamatan ? '#F59E0B' : geocodeTarget.kabupaten ? '#10B981' : '#3B82F6';
            if (geo.geojson) {
              boundaryRef.current = L.geoJSON(geo.geojson, {
                style: { color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.1 },
              }).addTo(mapObj.current);
              mapObj.current.flyToBounds(boundaryRef.current.getBounds(), { padding: [40,40], maxZoom: zoom, duration: 1 });
            } else if (geo.boundingbox) {
              const [s, n, w2, e] = geo.boundingbox.map(Number);
              boundaryRef.current = L.rectangle([[s, w2], [n, e]], {
                color, weight: 2, opacity: 0.8, fillColor: color, fillOpacity: 0.1,
              }).addTo(mapObj.current);
              mapObj.current.flyToBounds([[s, w2], [n, e]], { padding: [40,40], maxZoom: zoom, duration: 1 });
            } else if (geo.lat && geo.lon) {
              mapObj.current.flyTo([parseFloat(geo.lat), parseFloat(geo.lon)], zoom, { duration: 1 });
            }
          }
        } catch {}

        // If we detected region from search but no filter was set, also show results
        if (geocodeTarget.detected && lokasis.length === 0) {
          // If no markers but we geocoded, still show results panel slightly differently
        }
      } else if (lokasis.length > 0 && !searchTerm?.trim()) {
        const bounds = lokasis.map(l => [parseFloat(l.latitude), parseFloat(l.longitude)]);
        mapObj.current.flyToBounds(bounds, { padding: [40,40], maxZoom: 15, duration: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, detectSearch, provinsis, kabupatens, kecamatans, desas, kategoris]);

  useEffect(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => loadData(), 400);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [filters, searchTerm]);

  // ── User location ────────────────────
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapObj.current) {
          mapObj.current.flyTo([latitude, longitude], 15, { duration: 1 });
          if (userMarkerRef.current) mapObj.current.removeLayer(userMarkerRef.current);
          const icon = L.divIcon({
            html: '<div style="width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.5);"/>',
            className: '', iconSize: [18, 18], iconAnchor: [9, 9],
          });
          userMarkerRef.current = L.marker([latitude, longitude], { icon }).addTo(mapObj.current);
          userMarkerRef.current.bindPopup('Lokasi Anda');
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  // ── Fly to location ──────────────────
  const flyToLocation = useCallback((item) => {
    if (!mapObj.current) return;
    const lat = parseFloat(item.latitude);
    const lng = parseFloat(item.longitude);
    mapObj.current.flyTo([lat, lng], 16, { duration: 0.8 });
    setTimeout(() => {
      L.popup({ maxWidth: 320, className: 'public-popup' })
        .setLatLng([lat, lng])
        .setContent(popupHtml(item))
        .openOn(mapObj.current);
    }, 900);
  }, []);

  // ── Auto-fly to first result on search ──
  useEffect(() => {
    if (showResults && results.length > 0 && (searchTerm?.trim() || filters.kategori_id)) {
      const timer = setTimeout(() => flyToLocation(results[0]), 500);
      return () => clearTimeout(timer);
    }
  }, [results.length, showResults]);

  // ── Navigation helpers ───────────────
  const currentStep = navStateRef.current.steps[navStepIdx];
  const nextStep = navStateRef.current.steps[navStepIdx + 1];
  const navInstruction = currentStep ? getNavInstruction(currentStep) : { icon: '', text: '', road: '' };
  const nextInstruction = nextStep ? getNavInstruction(nextStep) : null;
  const totalSteps = navStateRef.current.steps.length;
  const isLastStep = navStepIdx >= totalSteps - 1;

  // Format remaining
  const remKm = (navRemaining.distance / 1000).toFixed(1);
  const remMin = Math.round(navRemaining.duration / 60);
  const remH = Math.floor(remMin / 60);
  const remM = remMin % 60;
  const remTimeStr = remH > 0 ? `${remH}j ${remM}m` : `${remM}m`;
  const progress = totalSteps > 1 ? navStepIdx / (totalSteps - 1) : 0;

  return (
    <>
      <SEO
        title="Peta Interaktif"
        description="Jelajahi peta interaktif lokasi-lokasi di Desa Cibulakan, Kecamatan Cianjur. Temukan UMKM, wisata, fasilitas umum, dan lainnya."
        url="/"
      />
      <div className="h-screen w-screen overflow-hidden relative bg-gray-100 font-sans">
      {/* Map */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto">
          <div className="w-16 h-16 rounded-full border-[5px] border-white/20 border-t-emerald-400 animate-spin" />
        </div>
      )}

      {/* Route loading */}
      {routeLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3 text-sm text-gray-500">
            <div className="w-5 h-5 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
            Mencari rute terbaik...
          </div>
        </div>
      )}

      {/* ═══════════════ NAVIGATION UI ═══════════════ */}
      {navigationActive && (
        <>
          {/* Navigation top bar */}
          <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 shadow-lg pointer-events-auto">
              <div className="flex items-center justify-between mb-3">
                <button onClick={stopNavigation}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all">
                  <X size={18} />
                  Selesai
                </button>
                <span className="text-xs font-medium text-gray-400">
                  {navStepIdx + 1} / {totalSteps}
                </span>
              </div>

              {/* Main instruction */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: navInstruction.icon.replace('currentColor', '#059669').replace('stroke-width="2"', 'stroke-width="2.5"')
                  }} />
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-tight">{navInstruction.text}</p>
                  {navInstruction.road && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{navInstruction.road}</p>
                  )}
                </div>
              </div>

              {/* Next turn preview */}
              {nextInstruction && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400"
                    dangerouslySetInnerHTML={{ __html: nextInstruction.icon }} />
                  <p className="text-xs text-gray-500 truncate">
                    {nextInstruction.text}{nextInstruction.road ? ` · ${nextInstruction.road}` : ''}
                  </p>
                </div>
              )}

              {/* Arrival info */}
              {isLastStep && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"
                      dangerouslySetInnerHTML={{ __html: getStepIcon('arrive', '').replace('currentColor', '#059669') }} />
                    <p className="text-sm font-semibold text-emerald-600">Anda telah tiba di tujuan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md px-5 py-4 shadow-lg pointer-events-auto">
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progress * 100)}%`, background: modeColors[routeMode] || '#059669' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Route size={14} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-800">{remKm} km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-800">{remTimeStr}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="font-medium">{modeLabels[routeMode]}</span>
                  <span>·</span>
                  <span>{routeInfo?.destination || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ NORMAL UI (hidden during navigation) ═══════════════ */}
      {!navigationActive && (
        <>
          {/* Top bar */}
          <div className={`absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-start gap-2 sm:gap-3 pointer-events-none ${pageReady ? 'anim-fade-up-1' : 'opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 px-4 py-3 flex items-center gap-3 pointer-events-auto flex-shrink-0">
              <img src={logoCianjur} alt="Logo Cianjur"
                className="w-9 h-9 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-tight">Desa Cibulakan</p>
                <p className="text-[10px] text-gray-400 font-medium">Zonasi GIS · Peta Interaktif</p>
              </div>
              {user && (
                <button onClick={() => {
                  Swal.fire({
                    title: 'Yakin ingin keluar?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Keluar',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#ef4444',
                  }).then(r => { if (r.isConfirmed) logout(); });
                }}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Keluar">
                  <LogOut size={15} />
                </button>
              )}
            </div>

            <div className="flex-1 sm:max-w-md pointer-events-auto">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari UMKM, tempat, atau alamat..."
                  className="w-full h-12 pl-11 pr-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:bg-white transition-all" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Category chips */}
              <div className="flex gap-1.5 mt-2 flex-wrap pointer-events-auto">
                {kategoris.map(k => {
                  const active = filters.kategori_id === String(k.id);
                  return (
                    <button key={k.id} onClick={() => setF('kategori_id')({ target: { value: active ? '' : String(k.id) } })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm
                        ${active ? 'text-white' : 'bg-white/80 text-gray-600 hover:bg-white border border-white/60'}`}
                      style={active ? { background: k.warna || '#6B7280' } : {}}>
                      <span className="w-2 h-2 rounded-full" style={{ background: k.warna || '#6B7280' }} />
                      {k.nama}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter button */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`absolute z-20 pointer-events-auto top-[160px] sm:top-[88px] ${pageReady ? 'anim-fade-up-2' : 'opacity-0'}`}
            style={{ left: '16px' }}>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 px-4 py-3 flex items-center gap-2.5 hover:bg-white transition-all">
              <Filter size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">Filter</span>
              {count > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{count}</span>
              )}
              {showFilters ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </button>

          {/* Filter panel */}
          {showFilters && (
            <div className="absolute z-20 pointer-events-none w-56 sm:w-64 lg:w-72"
              style={{ top: 'clamp(170px, 22vh, 148px)', left: '12px', bottom: '12px' }}>
              <div className="h-full bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-4 overflow-y-auto pointer-events-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter</span>
                  <button onClick={() => setShowFilters(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Provinsi</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl text-sm border border-gray-200/60 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" value={filters.provinsi_id} onChange={setF('provinsi_id')}>
                      <option value="">Semua Provinsi</option>
                      {provinsis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kabupaten</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl text-sm border border-gray-200/60 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" value={filters.kabupaten_id} onChange={setF('kabupaten_id')} disabled={!filters.provinsi_id}>
                      <option value="">Semua Kabupaten</option>
                      {kabupatens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kecamatan</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl text-sm border border-gray-200/60 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" value={filters.kecamatan_id} onChange={setF('kecamatan_id')} disabled={!filters.kabupaten_id}>
                      <option value="">Semua Kecamatan</option>
                      {kecamatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Desa</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl text-sm border border-gray-200/60 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" value={filters.desa_id} onChange={setF('desa_id')} disabled={!filters.kecamatan_id}>
                      <option value="">Semua Desa</option>
                      {desas.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl text-sm border border-gray-200/60 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" value={filters.kategori_id} onChange={setF('kategori_id')}>
                      <option value="">Semua Kategori</option>
                      {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <Layers size={12} /> Kategori
                  </h4>
                  <div className="space-y-2">
                    {kategoris.map(k => (
                      <div key={k.id} className="flex items-center gap-2.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white" style={{ background: k.warna||'#6B7280' }} />
                        <span className="font-medium">{k.nama}</span>
                        <span className="cat-count ml-auto text-[11px] text-gray-400 font-semibold">{categoryCounts[k.id] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results panel */}
          {panelState !== 'hidden' && (
            <div className={`absolute z-30 pointer-events-none transition-all duration-300 ${showFilters ? 'left-[270px] sm:left-[290px] lg:left-[310px]' : 'left-3'} ${panelClass}`}
              style={{ top: 'clamp(160px, 18vh, 90px)', bottom: '12px', width: 'clamp(280px, 35vw, 400px)' }}>
              <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 flex flex-col pointer-events-auto overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-800">{results.length} hasil ditemukan</span>
                  <button onClick={() => setShowResults(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {results.map((item, idx) => {
                    const fotoUrl = item.fotos?.[0]?.url;
                    const kategoriWarna = item.kategori?.warna || '#6B7280';
                    return (
                      <div key={item.id} onClick={() => navigate('/lokasi/' + item.id)}
                        className="flex gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group animate-result-card"
                        style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          {fotoUrl ? (
                            <img src={fotoUrl} alt={item.nama_tempat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin size={22} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{item.nama_tempat}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium truncate max-w-[100px]"
                              style={{ background: kategoriWarna }}>
                              {item.kategori?.nama || 'Umum'}
                            </span>
                            {item.rating_rata_rata && (
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-yellow-600">
                                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                                {item.rating_rata_rata}
                              </span>
                            )}
                          </div>
                          {item.alamat && (
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.alamat}</p>
                          )}
                          {item.jarak && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-1">{item.jarak}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom left controls */}
          <div className={`absolute bottom-4 left-3 sm:bottom-6 sm:left-6 z-20 flex flex-col gap-2 pointer-events-none ${pageReady ? 'anim-fade-up-3' : 'opacity-0'}`}>
            {routeActive && (
              <button onClick={clearRoute}
                className="pointer-events-auto w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/60 flex items-center justify-center hover:bg-white transition-all"
                title="Tutup Rute">
                <X size={18} className="text-red-500" />
              </button>
            )}
            <button onClick={handleLocate} disabled={locating}
              className="pointer-events-auto w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/60 flex items-center justify-center hover:bg-white transition-all disabled:opacity-50"
              title="Lokasi Saya">
              <LocateFixed size={18} className={locating ? 'animate-spin text-emerald-500' : 'text-gray-600'} />
            </button>
            <div className="pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 px-4 py-2.5">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{loading ? '–' : count}</span> UMKM ditampilkan
                </p>
              </div>
            </div>
          </div>

          {/* Route bottom panel */}
          {routeActive && routeInfo && (
            <div className="absolute bottom-20 sm:bottom-24 left-2 right-2 sm:left-4 sm:right-4 z-20 pointer-events-none flex justify-center">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 px-4 sm:px-5 py-4 pointer-events-auto w-full max-w-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Navigation size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{routeInfo.destination}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Route size={12} className="text-emerald-500" />
                        <span className="font-semibold text-gray-700">{routeInfo.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} className="text-emerald-500" />
                        <span className="font-semibold text-gray-700">{routeInfo.duration}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={clearRoute}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>

                {/* Mode selector */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode Transportasi</p>
                  <div className="flex gap-1.5">
                    {['driving','motorcycle','walking'].map(m => {
                      const active = routeMode === m;
                      const mc = modeColors[m];
                      return (
                        <button key={m} onClick={() => handleModeChange(m)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${active ? 'text-white shadow-sm' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                          style={active ? { background: mc } : {}}>
                          {m === 'driving' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M15 17a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M8 11h8"/></svg>
                          ) : m === 'motorcycle' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16h12"/><path d="M18 7h-3l-2 4"/><path d="m2 10 3 3"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v12"/><path d="M9 8h6"/><path d="M7 20.5c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5V17H7v3.5z"/><path d="M7 13v4h10v-4"/></svg>
                          )}
                          {modeLabels[m]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mulai button */}
                <button onClick={startNavigation}
                  className="mt-3 w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                  <Play size={18} fill="white" />
                  Mulai
                </button>

                {/* Start marker */}
                {userLocation && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2.5 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">A</div>
                    <span className="truncate">Lokasi Anda</span>
                    <span className="flex-shrink-0 text-gray-300">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                  </div>
                )}

                {/* Step-by-step directions */}
                {routeSteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setShowSteps(!showSteps)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all">
                      <span className="flex items-center gap-1.5">
                        <Route size={12} />
                        Petunjuk Arah ({routeSteps.length})
                      </span>
                      {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showSteps && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-0">
                        {routeSteps.map((step, i) => {
                          const isLast = i === routeSteps.length - 1;
                          return (
                            <div key={i} className="flex gap-2.5 relative pb-1">
                              {!isLast && (
                                <div className="absolute left-[11px] top-5 bottom-0 w-px bg-gray-200" />
                              )}
                              <div className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-gray-50 mt-0.5"
                                dangerouslySetInnerHTML={{ __html: getStepIcon(step.maneuver.type, step.maneuver.modifier) }} />
                              <div className="flex-1 min-w-0 pb-2.5">
                                <p className="text-xs text-gray-700 leading-snug">
                                  {getStepText(step, i, routeSteps)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Attribution */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p className="text-[10px] text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">
          © OpenStreetMap | Zonasi GIS
        </p>
      </div>

      <style>{`
        .public-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06) !important;
          border: 1px solid rgba(255,255,255,0.8);
        }
        .public-popup .leaflet-popup-content { margin: 0 !important; }
        .public-popup .leaflet-popup-tip { box-shadow: none; }
        .leaflet-control-zoom a {
          border-radius: 12px !important;
          background: rgba(255,255,255,0.9) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255,255,255,0.6) !important;
          color: #374151 !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom a:hover { background: rgba(255,255,255,1) !important; }
        .leaflet-control-zoom { border: none !important; gap: 6px !important; display: flex !important; flex-direction: column !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      </div>
    </>
  );
}
