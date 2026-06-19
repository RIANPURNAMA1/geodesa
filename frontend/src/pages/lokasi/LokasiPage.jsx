import { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Pencil, Trash2, Search, MapPin, Phone, User, Eye, X, Image, Map, Crosshair, Navigation } from 'lucide-react';
import { lokasiApi, kategoriApi, wilayahApi } from '../../api';
import Modal          from '../../components/common/Modal';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import Pagination     from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast }   from '../../components/common/Toast';
import { useAuth }    from '../../contexts/AuthContext';
import LokasiDetail   from './LokasiDetail';
import MapPicker      from '../../components/map/MapPicker';

const EMPTY_FORM = {
  provinsi_id: '', provinsi_nama: '',
  kabupaten_id: '', kabupaten_nama: '',
  kecamatan_id: '', kecamatan_nama: '',
  desa_id: '', desa_nama: '',
  kategori_id: '',
  nama_tempat: '', nama_pemilik: '', nomor_telepon: '',
  alamat: '', deskripsi: '', latitude: '', longitude: '', is_active: true,
};

export default function LokasiPage() {
  const toast      = useToast();
  const { isAdmin } = useAuth();

  const [data,       setData]       = useState([]);
  const [meta,       setMeta]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [filterProv, setFilterProv] = useState('');
  const [filterKab,  setFilterKab]  = useState('');
  const [filterKec,  setFilterKec]  = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterKat,  setFilterKat]  = useState('');
  const [filterKabupatens, setFilterKabupatens] = useState([]);
  const [page,       setPage]       = useState(1);

  const [modal,      setModal]      = useState(false);
  const [confirm,    setConfirm]    = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mapOpen,    setMapOpen]    = useState(false);

  const [editing,    setEditing]    = useState(null);
  const [viewing,    setViewing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [fotos,      setFotos]      = useState([]);
  const [fotoPrev,   setFotoPrev]   = useState([]);
  const [existFotos, setExistFotos] = useState([]);
  const fileInputRef = useRef();
  const addMapRef = useRef(null);
  const addMapObj = useRef(null);
  const [detecting,   setDetecting]  = useState(false);
  const [locationPicked, setLocationPicked] = useState(false);

  // Wilayah data
  const [provinsis,         setProvinsis]  = useState([]);
  const [kabupatens,        setKabupatens] = useState([]);
  const [kecamatans,        setKecamatans] = useState([]);
  const [desas,             setDesas]      = useState([]);
  const [kategoris,         setKategoris]  = useState([]);
  // Filter dropdown data
  const [filterKecamatans,  setFilterKecamatans] = useState([]);
  const [filterDesas,       setFilterDesas]      = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    const params = { search, page };
    if (filterKec)  params.kecamatan_id = filterKec;
    if (filterDesa) params.desa_id = filterDesa;
    if (filterKat)  params.kategori_id = filterKat;
    if (filterKab)  params.kabupaten_id = filterKab;
    if (filterProv) params.provinsi_id = filterProv;
    lokasiApi.list(params)
      .then(r => { setData(r.data.data.data || r.data.data); setMeta(r.data.data); })
      .finally(() => setLoading(false));
  }, [search, page, filterKec, filterDesa, filterKat]);

  useEffect(() => { load(); }, [load]);

  // Initial data load
  useEffect(() => {
    wilayahApi.provinsi().then(r => setProvinsis(r.data.data));
    kategoriApi.all().then(r => setKategoris(r.data.data));
  }, []);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    if (k === 'provinsi_id') {
      const prov = provinsis.find(p => String(p.id) === String(val));
      setForm(p => ({ ...p, provinsi_id: val, provinsi_nama: prov?.nama || '',
        kabupaten_id: '', kabupaten_nama: '', kecamatan_id: '', kecamatan_nama: '', desa_id: '', desa_nama: '' }));
      if (val) {
        wilayahApi.kabupaten(val).then(r => setKabupatens(r.data.data));
      } else {
        setKabupatens([]); setKecamatans([]); setDesas([]);
      }
    } else if (k === 'kabupaten_id') {
      const kab = kabupatens.find(k => String(k.id) === String(val));
      setForm(p => ({ ...p, kabupaten_id: val, kabupaten_nama: kab?.nama || '',
        kecamatan_id: '', kecamatan_nama: '', desa_id: '', desa_nama: '' }));
      if (val) {
        wilayahApi.kecamatan(val).then(r => setKecamatans(r.data.data));
      } else {
        setKecamatans([]); setDesas([]);
      }
    } else if (k === 'kecamatan_id') {
      const kec = kecamatans.find(k => String(k.id) === String(val));
      setForm(p => ({ ...p, kecamatan_id: val, kecamatan_nama: kec?.nama || '',
        desa_id: '', desa_nama: '' }));
      if (val) {
        wilayahApi.desa(val).then(r => setDesas(r.data.data));
      } else {
        setDesas([]);
      }
    } else if (k === 'desa_id') {
      const d = desas.find(d => String(d.id) === String(val));
      setForm(p => ({ ...p, desa_id: val, desa_nama: d?.nama || '' }));
    } else {
      setForm(p => ({ ...p, [k]: val }));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast('Geolocation tidak didukung browser ini', 'error');
      return;
    }

    setDetecting(true);

    const detect = (highAccuracy) => new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 8000 : 5000,
        maximumAge: 0,
      });
    });

    (async () => {
      try {
        let pos;
        try { pos = await detect(true); }
        catch { pos = await detect(false); }

        const res = await wilayahApi.detectLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        const d = res.data.data;

        if (d.provinsi) {
          const kabRes = await wilayahApi.kabupaten(d.provinsi.id);
          setKabupatens(kabRes.data.data);
        }
        if (d.kabupaten) {
          const kecRes = await wilayahApi.kecamatan(d.kabupaten.id);
          setKecamatans(kecRes.data.data);
        }
        if (d.kecamatan) {
          const desaRes = await wilayahApi.desa(d.kecamatan.id);
          setDesas(desaRes.data.data);
        }

        setForm(p => ({
          ...p,
          latitude: d.latitude,
          longitude: d.longitude,
          alamat: d.alamat || p.alamat,
          provinsi_id: d.provinsi?.id || p.provinsi_id,
          provinsi_nama: d.provinsi?.nama || p.provinsi_nama,
          kabupaten_id: d.kabupaten?.id || p.kabupaten_id,
          kabupaten_nama: d.kabupaten?.nama || p.kabupaten_nama,
          kecamatan_id: d.kecamatan?.id || p.kecamatan_id,
          kecamatan_nama: d.kecamatan?.nama || p.kecamatan_nama,
          desa_id: d.desa?.id || p.desa_id,
          desa_nama: d.desa?.nama || p.desa_nama,
        }));

        toast(d.alamat ? 'Lokasi terdeteksi' : 'Lokasi terdeteksi (kurang akurat)');
        setLocationPicked(true);
      } catch {
        toast('Gagal mendeteksi lokasi', 'error');
      } finally {
        setDetecting(false);
      }
    })();
  };

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setErrors({});
    setFotos([]); setFotoPrev([]); setExistFotos([]);
    setKabupatens([]); setKecamatans([]); setDesas([]);
    setLocationPicked(false);
    setModal(true);
  };

  const openEdit = async (item) => {
    setEditing(item);

    const pId = item.provinsi_id || '';
    const kabId = item.kabupaten_id || '';
    const kecId = item.kecamatan_id || '';

    if (pId) {
      const kabRes = await wilayahApi.kabupaten(pId);
      setKabupatens(kabRes.data.data);
    }
    if (kabId) {
      const kecRes = await wilayahApi.kecamatan(kabId);
      setKecamatans(kecRes.data.data);
    }
    if (kecId) {
      const desaRes = await wilayahApi.desa(kecId);
      setDesas(desaRes.data.data);
    }

    setForm({
      provinsi_id: pId,
      provinsi_nama: item.provinsi_nama || '',
      kabupaten_id: kabId,
      kabupaten_nama: item.kabupaten_nama || '',
      kecamatan_id: kecId,
      kecamatan_nama: item.kecamatan_nama || item.kecamatan?.nama || '',
      desa_id: item.desa_id || '',
      desa_nama: item.desa_nama || item.desa?.nama || '',
      kategori_id: item.kategori_id,
      nama_tempat: item.nama_tempat,
      nama_pemilik: item.nama_pemilik || '',
      nomor_telepon: item.nomor_telepon || '',
      alamat: item.alamat,
      deskripsi: item.deskripsi || '',
      latitude: item.latitude,
      longitude: item.longitude,
      is_active: item.is_active,
    });
    setExistFotos(item.fotos || []);
    setFotos([]); setFotoPrev([]); setErrors({});
    setModal(true);
  };

  const openView   = (item) => { setViewing(item); setDetailOpen(true); };
  const openDel    = (item) => { setEditing(item); setConfirm(true); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await lokasiApi.destroy(editing.id);
      toast('Lokasi berhasil dihapus');
      setConfirm(false); load();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menghapus', 'error');
    } finally { setDeleting(false); }
  };

  const handleFotoChange = (e) => {
    const files = Array.from(e.target.files);
    setFotos(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setFotoPrev(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeFotoNew  = (i) => {
    setFotos(prev => prev.filter((_, idx) => idx !== i));
    setFotoPrev(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeFotoExist = async (foto) => {
    try {
      await lokasiApi.deleteFoto(foto.id);
      setExistFotos(prev => prev.filter(f => f.id !== foto.id));
      toast('Foto dihapus');
    } catch { toast('Gagal menghapus foto', 'error'); }
  };

  const handleMapPick = ({ lat, lng }) => {
    setForm(p => ({ ...p, latitude: lat, longitude: lng }));
    setMapOpen(false);
    setLocationPicked(true);
  };

  // Init map for the map-first add flow
  useEffect(() => {
    if (!modal || editing) return;
    const container = addMapRef.current;
    if (!container) return;

    if (addMapObj.current) { addMapObj.current.remove(); addMapObj.current = null; }

    const zoom = locationPicked ? 15 : 12;
    const lat = parseFloat(form.latitude) || -7.3274;
    const lng = parseFloat(form.longitude) || 108.3437;
    const map = L.map(container).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    let marker = null;
    if (locationPicked && form.latitude && form.longitude) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on('dragend', (e) => {
        const { lat: mlat, lng: mlng } = e.target.getLatLng();
        setForm(p => ({ ...p, latitude: mlat.toFixed(8), longitude: mlng.toFixed(8) }));
      });
    }

    if (!locationPicked) {
      map.on('click', (e) => {
        if (!marker) marker = L.marker(e.latlng).addTo(map);
        else marker.setLatLng(e.latlng);
        setForm(p => ({ ...p, latitude: e.latlng.lat.toFixed(8), longitude: e.latlng.lng.toFixed(8) }));
        setLocationPicked(true);
      });
    }

    addMapObj.current = map;

    return () => {
      if (addMapObj.current) { addMapObj.current.remove(); addMapObj.current = null; marker = null; }
      // Don't remove the container div, just the map instance
    };
  }, [modal, editing, locationPicked]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (form.is_active) fd.set('is_active', '1'); else fd.set('is_active', '0');
    fotos.forEach(f => fd.append('fotos[]', f));

    try {
      if (editing) {
        fd.append('_method', 'PUT');
        await lokasiApi.update(editing.id, fd);
        toast('Lokasi berhasil diperbarui');
      } else {
        await lokasiApi.store(fd);
        toast('Lokasi berhasil ditambahkan');
      }
      setModal(false); load();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSaving(false); }
  };

  // Filter handlers
  const handleFilterProvChange = (e) => {
    const val = e.target.value;
    setFilterProv(val);
    setFilterKab(''); setFilterKec(''); setFilterDesa('');
    setFilterKabupatens([]); setFilterKecamatans([]); setFilterDesas([]);
    setPage(1);
    if (val) wilayahApi.kabupaten(val).then(r => setFilterKabupatens(r.data.data));
  };

  const handleFilterKabChange = (e) => {
    const val = e.target.value;
    setFilterKab(val);
    setFilterKec(''); setFilterDesa('');
    setFilterKecamatans([]); setFilterDesas([]);
    setPage(1);
    if (val) wilayahApi.kecamatan(val).then(r => setFilterKecamatans(r.data.data));
  };

  const handleFilterKecChange = (e) => {
    const val = e.target.value;
    setFilterKec(val);
    setFilterDesa('');
    setFilterDesas([]);
    setPage(1);
    if (val) wilayahApi.desa(val).then(r => setFilterDesas(r.data.data));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Cari lokasi..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button onClick={openAdd} className="btn-primary flex-shrink-0">
            <Plus size={16} /> Tambah Lokasi
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto text-sm" value={filterProv} onChange={handleFilterProvChange}>
            <option value="">Semua Provinsi</option>
            {provinsis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filterKab} onChange={handleFilterKabChange}
            disabled={!filterProv}>
            <option value="">Semua Kabupaten</option>
            {filterKabupatens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filterKec} onChange={handleFilterKecChange}
            disabled={!filterKab}>
            <option value="">Semua Kecamatan</option>
            {filterKecamatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filterDesa} onChange={e => { setFilterDesa(e.target.value); setPage(1); }}
            disabled={!filterKec}>
            <option value="">Semua Desa</option>
            {filterDesas.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filterKat} onChange={e => { setFilterKat(e.target.value); setPage(1); }}>
            <option value="">Semua Kategori</option>
            {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? <LoadingSpinner /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100/80">
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Lokasi</th>
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Kategori</th>
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">Kecamatan / Desa</th>
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">Pemilik</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {data.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm font-medium">Belum ada data lokasi</td></tr>
                  ) : data.map(item => (
                    <tr key={item.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin size={14} className="text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.nama_tempat}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.alamat}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {item.kategori && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ background: item.kategori.warna || '#6B7280' }}>
                            {item.kategori.nama}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                        <div className="font-medium text-gray-700">{item.kecamatan_nama || item.kecamatan?.nama}</div>
                        <div className="text-gray-400">{item.desa_nama || item.desa?.nama}</div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                        <div className="font-medium text-gray-700">{item.nama_pemilik || '–'}</div>
                        {item.nomor_telepon && <div className="text-gray-400">{item.nomor_telepon}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openView(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Detail">
                            <Eye size={14} />
                          </button>
                          {item.latitude && item.longitude && (
                            <a href={`/peta?lat=${item.latitude}&lng=${item.longitude}&nama=${encodeURIComponent(item.nama_tempat)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all inline-flex" title="Lihat di Peta">
                              <Navigation size={14} />
                            </a>
                          )}
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => openDel(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Form Modal — map-first flow */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Lokasi' : 'Tambah Lokasi'} size={!locationPicked || editing ? 'xl' : 'xl'}>
        {!locationPicked && !editing ? (
          /* Step 1: Map only — pick location first */
          <div className="relative">
            <div ref={addMapRef} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 480 }} />
            <div className="mt-3 flex gap-2 justify-center">
              <button type="button" onClick={handleDetectLocation} disabled={detecting}
                className="btn-primary btn-sm text-sm">
                <Crosshair size={14} className={detecting ? 'animate-spin' : ''} />
                {detecting ? 'Mendeteksi...' : 'Lokasi Terkini'}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">Atau klik pada peta untuk memilih titik lokasi.</p>
          </div>
        ) : (
          /* Step 2: Compact map + detail form */
          <form onSubmit={handleSave} className="space-y-5">
            {!editing && (
              <div ref={addMapRef} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }} />
            )}
            {/* Identitas */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informasi Lokasi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Nama Tempat <span className="text-red-500">*</span></label>
                  <input className={`input ${errors.nama_tempat ? 'border-red-300' : ''}`}
                    placeholder="Warung Bu Sari" value={form.nama_tempat} onChange={set('nama_tempat')} required />
                  {errors.nama_tempat && <p className="text-xs text-red-500 mt-1">{errors.nama_tempat[0]}</p>}
                </div>
                <div>
                  <label className="label">Nama Pemilik</label>
                  <input className="input" placeholder="Nama pemilik" value={form.nama_pemilik} onChange={set('nama_pemilik')} />
                </div>
                <div>
                  <label className="label">Nomor Telepon</label>
                  <input className="input" placeholder="08xx" value={form.nomor_telepon} onChange={set('nomor_telepon')} />
                </div>
                <div>
                  <label className="label">Kategori <span className="text-red-500">*</span></label>
                  <select className={`input ${errors.kategori_id ? 'border-red-300' : ''}`}
                    value={form.kategori_id} onChange={set('kategori_id')} required>
                    <option value="">Pilih Kategori</option>
                    {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                  {errors.kategori_id && <p className="text-xs text-red-500 mt-1">{errors.kategori_id[0]}</p>}
                </div>
                <div>
                  <label className="label">Provinsi</label>
                  <select className="input" value={form.provinsi_id} onChange={set('provinsi_id')}>
                    <option value="">Pilih Provinsi</option>
                    {provinsis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kabupaten</label>
                  <select className="input" value={form.kabupaten_id} onChange={set('kabupaten_id')} disabled={!form.provinsi_id}>
                    <option value="">Pilih Kabupaten</option>
                    {kabupatens.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kecamatan <span className="text-red-500">*</span></label>
                  <select className={`input ${errors.kecamatan_id ? 'border-red-300' : ''}`}
                    value={form.kecamatan_id} onChange={set('kecamatan_id')} required disabled={!form.kabupaten_id}>
                    <option value="">Pilih Kecamatan</option>
                    {kecamatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Desa <span className="text-red-500">*</span></label>
                  <select className={`input ${errors.desa_id ? 'border-red-300' : ''}`}
                    value={form.desa_id} onChange={set('desa_id')} required disabled={!form.kecamatan_id}>
                    <option value="">Pilih Desa</option>
                    {desas.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="label">Alamat <span className="text-red-500">*</span></label>
                <textarea className={`input resize-none min-h-[70px] ${errors.alamat ? 'border-red-300' : ''}`}
                  placeholder="Jl. Raya No. 1, RT 01, RW 02..." value={form.alamat} onChange={set('alamat')} required />
              </div>
              <div className="mt-3">
                <label className="label">Deskripsi</label>
                <textarea className="input resize-none min-h-[70px]" placeholder="Deskripsi lengkap lokasi..."
                  value={form.deskripsi} onChange={set('deskripsi')} />
              </div>
            </div>

            {/* Koordinat */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Koordinat GPS</h4>
                <div className="flex gap-2">
                  <button type="button" onClick={handleDetectLocation} disabled={detecting}
                    className="btn-secondary btn-sm text-xs">
                    <Crosshair size={12} className={detecting ? 'animate-spin' : ''} /> {detecting ? 'Mendeteksi...' : 'Lokasi Saya'}
                  </button>
                  <button type="button" onClick={() => setMapOpen(true)}
                    className="btn-secondary btn-sm text-xs">
                    <Map size={12} /> Pilih di Peta
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Latitude <span className="text-red-500">*</span></label>
                  <input className={`input font-mono text-xs ${errors.latitude ? 'border-red-300' : ''}`}
                    placeholder="-7.3274" value={form.latitude} onChange={set('latitude')} required />
                  {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude[0]}</p>}
                </div>
                <div>
                  <label className="label">Longitude <span className="text-red-500">*</span></label>
                  <input className={`input font-mono text-xs ${errors.longitude ? 'border-red-300' : ''}`}
                    placeholder="108.3437" value={form.longitude} onChange={set('longitude')} required />
                  {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude[0]}</p>}
                </div>
              </div>
            </div>

            {/* Foto */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Foto Lokasi</h4>
              {existFotos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {existFotos.map(foto => (
                    <div key={foto.id} className="relative group">
                      <img src={foto.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => removeFotoExist(foto)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {fotoPrev.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {fotoPrev.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-blue-200" />
                      <button type="button" onClick={() => removeFotoNew(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all w-full justify-center">
                <Image size={16} /> Upload Foto
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFotoChange} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" className="w-4 h-4 accent-blue-600"
                checked={form.is_active} onChange={set('is_active')} />
              <label htmlFor="is_active" className="text-sm text-gray-700">Lokasi Aktif</label>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Lokasi'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Map picker */}
      <Modal open={mapOpen} onClose={() => setMapOpen(false)} title="Pilih Koordinat dari Peta" size="xl">
        <MapPicker
          initialLat={form.latitude || -7.3274}
          initialLng={form.longitude || 108.3437}
          onPick={handleMapPick}
        />
      </Modal>

      {/* Detail modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detail Lokasi" size="xl">
        {viewing && <LokasiDetail lokasi={viewing} />}
      </Modal>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={handleDelete}
        title="Hapus Lokasi" message={`Hapus lokasi "${editing?.nama_tempat}"? Semua foto terkait akan dihapus.`} loading={deleting} />
    </div>
  );
}
