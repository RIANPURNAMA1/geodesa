import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Fix common typo: missing colon after protocol (e.g. "https//" instead of "https://")
const BASE_URL = RAW_URL.replace(/^([a-zA-Z]+)\/\//, '$1://');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — just clear token, let route guards handle redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(err);
  }
);

export default api;
export { BASE_URL };

// ── Auth ──────────────────────────────
export const authApi = {
  login:          (data) => api.post('/login', data),
  registerPublic: (data) => api.post('/register-public', data),
  logout:         ()     => api.post('/logout'),
  me:             ()     => api.get('/me'),
};

// ── Dashboard ─────────────────────────
export const dashboardApi = {
  index: () => api.get('/dashboard'),
};

// ── Wilayah (from API Wilayah Indonesia, not database) ──
export const wilayahApi = {
  provinsi:      ()       => api.get('/wilayah/provinsi'),
  kabupaten:     (provId) => api.get('/wilayah/kabupaten', { params: { provinsi_id: provId } }),
  kecamatan:     (kabId)  => api.get('/wilayah/kecamatan', { params: { kabupaten_id: kabId } }),
  desa:          (kecId)  => api.get('/wilayah/desa',      { params: { kecamatan_id: kecId } }),
  detectLocation: (data)  => api.post('/wilayah/lokasi-saya', data),
  geocode:        (params) => api.get('/wilayah/geocode', { params }),
};

// ── Kecamatan (via API proxy) ─────────
export const kecamatanApi = {
  list:    (params) => api.get('/kecamatan', { params }),
  all:     (kabId)  => api.get('/kecamatan', { params: { kabupaten_id: kabId } }),
  show:    (id)     => api.get(`/kecamatan/${id}`),
};

// ── Desa (via API proxy) ──────────────
export const desaApi = {
  list:    (params) => api.get('/desa', { params }),
  all:     (kecId)  => api.get('/desa', { params: { kecamatan_id: kecId } }),
  show:    (id)     => api.get(`/desa/${id}`),
};

// ── Kategori ──────────────────────────
export const kategoriApi = {
  list:    (params) => api.get('/kategori', { params }),
  all:     ()       => api.get('/kategori', { params: { paginate: 'false' } }),
  store:   (data)   => api.post('/kategori', data),
  show:    (id)     => api.get(`/kategori/${id}`),
  update:  (id, d)  => api.put(`/kategori/${id}`, d),
  destroy: (id)     => api.delete(`/kategori/${id}`),
};

// ── Lokasi ────────────────────────────
export const lokasiApi = {
  list:    (params) => api.get('/lokasi', { params }),
  mapData: (params) => api.get('/map/lokasi', { params }),
  store:   (data)   => api.post('/lokasi', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  show:    (id)     => api.get(`/lokasi/${id}`),
  update:  (id, d)  => api.post(`/lokasi/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy: (id)     => api.delete(`/lokasi/${id}`),
  deleteFoto:   (fotoId) => api.delete(`/lokasi/foto/${fotoId}`),
  radiusSearch: (data)   => api.post('/lokasi/radius-search', data),
};

// ── Komentar ──────────────────────────
export const komentarApi = {
  list:    (lokasiId)      => api.get(`/lokasi/${lokasiId}/komentar`),
  store:   (lokasiId, data) => api.post(`/lokasi/${lokasiId}/komentar`, data),
  destroy: (komentarId)     => api.delete(`/komentar/${komentarId}`),
};

// ── Notifikasi ─────────────────────────
export const notifikasiApi = {
  index: () => api.get('/notifikasi'),
};

// ── Routing ────────────────────────────
export const routingApi = {
  getRoute: (fromLat, fromLng, toLat, toLng) =>
    api.get('/routing', { params: { from_lat: fromLat, from_lng: fromLng, to_lat: toLat, to_lng: toLng } }),
};

// ── Settings ──────────────────────────
export const settingsApi = {
  updateProfile:  (data) => api.post('/settings/profile', data),
  updatePassword: (data) => api.post('/settings/password', data),
};

// ── Users ─────────────────────────────
export const userApi = {
  list:    (params) => api.get('/users', { params }),
  store:   (data)   => api.post('/users', data),
  show:    (id)     => api.get(`/users/${id}`),
  update:  (id, d)  => api.put(`/users/${id}`, d),
  destroy: (id)     => api.delete(`/users/${id}`),
};
