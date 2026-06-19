import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Tags, icons } from 'lucide-react';
import { kategoriApi } from '../../api';
import Modal          from '../../components/common/Modal';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import Pagination     from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast }   from '../../components/common/Toast';
import IconPicker     from '../../components/common/IconPicker';

const EMPTY_FORM = { nama: '', ikon: '', warna: '#3B82F6', deskripsi: '' };

const DEFAULT_KATEGORI = [
  { nama: 'Warung',        ikon: 'store',       warna: '#F59E0B' },
  { nama: 'UMKM',          ikon: 'briefcase',   warna: '#10B981' },
  { nama: 'Sekolah',       ikon: 'graduation-cap', warna: '#3B82F6' },
  { nama: 'Posyandu',      ikon: 'heart-pulse', warna: '#EF4444' },
  { nama: 'Tempat Wisata', ikon: 'map-pin',     warna: '#8B5CF6' },
  { nama: 'Fasilitas Umum',ikon: 'building',    warna: '#6B7280' },
];

export default function KategoriPage() {
  const toast = useToast();
  const [data,    setData]    = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [modal,   setModal]   = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});

  const load = useCallback(() => {
    setLoading(true);
    kategoriApi.list({ search, page })
      .then(r => { setData(r.data.data.data || r.data.data); setMeta(r.data.data); })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ nama: item.nama, ikon: item.ikon||'', warna: item.warna||'#3B82F6', deskripsi: item.deskripsi||'' });
    setErrors({}); setModal(true);
  };
  const openDel  = (item) => { setEditing(item); setConfirm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      if (editing) { await kategoriApi.update(editing.id, form); toast('Kategori berhasil diperbarui'); }
      else          { await kategoriApi.store(form); toast('Kategori berhasil ditambahkan'); }
      setModal(false); load();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await kategoriApi.destroy(editing.id);
      toast('Kategori berhasil dihapus');
      setConfirm(false); load();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menghapus', 'error');
    } finally { setDeleting(false); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Cari kategori..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {/* Grid cards */}
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-gray-400 text-sm font-medium rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >Belum ada data kategori</div>
            ) : data.map(item => (
              <div key={item.id} className="p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.warna + '20', border: `1px solid ${item.warna}30` }}>
                    {(() => {
                      const name = item.ikon || 'tags';
                      const pascal = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
                      const IconComp = icons[pascal];
                      return IconComp ? <IconComp size={18} style={{ color: item.warna }} /> : <Tags size={18} style={{ color: item.warna }} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 text-sm">{item.nama}</h3>
                      <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white" style={{ background: item.warna }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 font-medium">{item.deskripsi || 'Tidak ada deskripsi'}</p>
                    <p className="text-xs text-gray-500 mt-2 font-bold">{item.lokasis_count ?? 0} lokasi</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => openDel(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}
          >
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick fill buttons */}
          {!editing && (
            <div>
              <label className="label">Isi Cepat</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_KATEGORI.map(k => (
                  <button type="button" key={k.nama}
                    onClick={() => setForm(p => ({ ...p, nama: k.nama, ikon: k.ikon, warna: k.warna }))}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:shadow-sm"
                    style={{ borderColor: k.warna + '66', color: k.warna, background: k.warna + '11' }}
                  >
                    {k.nama}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="label">Nama Kategori <span className="text-red-500">*</span></label>
            <input className={`input ${errors.nama ? 'border-red-300' : ''}`}
              placeholder="Warung" value={form.nama} onChange={set('nama')} required />
            {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Warna</label>
              <div className="flex gap-2 items-center">
                <input type="color" className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  value={form.warna} onChange={set('warna')} />
                <input className="input flex-1" value={form.warna} onChange={set('warna')} placeholder="#3B82F6" />
              </div>
            </div>
            <div>
              <label className="label">Ikon</label>
              <IconPicker value={form.ikon} onChange={v => setForm(p => ({ ...p, ikon: v }))} />
            </div>
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea className="input min-h-[80px] resize-none" value={form.deskripsi} onChange={set('deskripsi')}
              placeholder="Deskripsi kategori..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={handleDelete}
        title="Hapus Kategori" message={`Hapus kategori "${editing?.nama}"?`} loading={deleting} />
    </div>
  );
}
