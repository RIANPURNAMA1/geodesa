import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Shield, UserCheck } from 'lucide-react';
import { userApi, wilayahApi } from '../../api';
import Modal          from '../../components/common/Modal';
import ConfirmDialog  from '../../components/common/ConfirmDialog';
import Pagination     from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast }   from '../../components/common/Toast';
import { useAuth }    from '../../contexts/AuthContext';

const EMPTY_FORM = { name:'', email:'', password:'', role:'operator_desa', provinsi_id:'', kabupaten_id:'', kecamatan_id:'', desa_id:'' };

export default function UsersPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const [data,       setData]       = useState([]);
  const [meta,       setMeta]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState(false);
  const [confirm,    setConfirm]    = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [provinsis,  setProvinsis]  = useState([]);
  const [kabupatens, setKabupatens] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [desas,      setDesas]      = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    userApi.list({ search, page })
      .then(r => { setData(r.data.data.data || r.data.data); setMeta(r.data.data); })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    wilayahApi.provinsi().then(r => setProvinsis(r.data.data));
  }, []);

  const set = (k) => (e) => {
    const val = e.target.value;
    if (k === 'provinsi_id') {
      setForm(p => ({ ...p, provinsi_id: val, kabupaten_id: '', kecamatan_id: '', desa_id: '' }));
      if (val) wilayahApi.kabupaten(val).then(r => setKabupatens(r.data.data));
      else { setKabupatens([]); setKecamatans([]); setDesas([]); }
    } else if (k === 'kabupaten_id') {
      setForm(p => ({ ...p, kabupaten_id: val, kecamatan_id: '', desa_id: '' }));
      if (val) wilayahApi.kecamatan(val).then(r => setKecamatans(r.data.data));
      else { setKecamatans([]); setDesas([]); }
    } else if (k === 'kecamatan_id') {
      setForm(p => ({ ...p, kecamatan_id: val, desa_id: '' }));
      if (val) wilayahApi.desa(val).then(r => setDesas(r.data.data));
      else setDesas([]);
    } else {
      setForm(p => ({ ...p, [k]: val }));
    }
  };

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setErrors({});
    setKabupatens([]); setKecamatans([]); setDesas([]);
    setModal(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name, email: item.email, password: '',
      role: item.role,
      provinsi_id: item.provinsi_id || '',
      kabupaten_id: item.kabupaten_id || '',
      kecamatan_id: item.kecamatan_id || '',
      desa_id: item.desa_id || '',
    });
    setErrors({}); setModal(true);
  };
  const openDel = (item) => { setEditing(item); setConfirm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      if (editing) {
        await userApi.update(editing.id, form);
        toast('User berhasil diperbarui');
      } else {
        await userApi.store(form);
        toast('User berhasil ditambahkan');
      }
      setModal(false); load();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userApi.destroy(editing.id);
      toast('User berhasil dihapus');
      setConfirm(false); load();
    } catch (err) {
      toast(err.response?.data?.message || 'Gagal menghapus', 'error');
    } finally { setDeleting(false); }
  };

  const roleLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'operator_desa') return 'Operator Desa';
    return 'User';
  };
  const roleBadge = (role) => {
    if (role === 'admin') return 'bg-violet-50 text-violet-700';
    if (role === 'operator_desa') return 'bg-blue-50 text-blue-700';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Cari pengguna..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <button onClick={openAdd} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

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
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Pengguna</th>
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Kecamatan / Desa</th>
                    <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {data.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm font-medium">Belum ada pengguna</td></tr>
                  ) : data.map(item => (
                    <tr key={item.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(16,185,129,0.2))' }}
                          >
                            <span className="text-emerald-700 font-bold text-sm">
                              {item.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(item.role)}`}>
                          {item.role === 'admin' ? <Shield size={10} /> : item.role === 'operator_desa' ? <UserCheck size={10} /> : <Users size={10} />}
                          {roleLabel(item.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        <div className="font-medium text-gray-700">{item.kecamatan_nama || item.kecamatan?.nama || '–'}</div>
                        <div className="text-gray-400">{item.desa_nama || item.desa?.nama || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                            <Pencil size={14} />
                          </button>
                          {item.id !== currentUser?.id && (
                            <button onClick={() => openDel(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={14} />
                            </button>
                          )}
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Pengguna' : 'Tambah Pengguna'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
            <input className={`input ${errors.name ? 'border-red-300' : ''}`}
              placeholder="John Doe" value={form.name} onChange={set('name')} required />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input type="email" className={`input ${errors.email ? 'border-red-300' : ''}`}
              placeholder="user@zonasi.id" value={form.email} onChange={set('email')} required />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <label className="label">{editing ? 'Password Baru (kosongkan jika tidak berubah)' : 'Password'} {!editing && <span className="text-red-500">*</span>}</label>
            <input type="password" className={`input ${errors.password ? 'border-red-300' : ''}`}
              placeholder="••••••••" value={form.password} onChange={set('password')}
              required={!editing} minLength={6} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
          </div>
          <div>
            <label className="label">Role <span className="text-red-500">*</span></label>
            <select className="input" value={form.role} onChange={set('role')}>
              <option value="operator_desa">Operator Desa</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'operator_desa' && (
            <>
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
                <label className="label">Kecamatan</label>
                <select className="input" value={form.kecamatan_id} onChange={set('kecamatan_id')} disabled={!form.kabupaten_id}>
                  <option value="">Pilih Kecamatan</option>
                  {kecamatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Desa</label>
                <select className="input" value={form.desa_id} onChange={set('desa_id')} disabled={!form.kecamatan_id}>
                  <option value="">Pilih Desa</option>
                  {desas.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={handleDelete}
        title="Hapus Pengguna" message={`Hapus pengguna "${editing?.name}"? Semua token login akan dihapus.`}
        loading={deleting} />
    </div>
  );
}
