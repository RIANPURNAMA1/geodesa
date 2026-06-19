import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPicker({ initialLat = -7.3274, initialLng = 108.3437, onPick }) {
  const mapRef  = useRef(null);
  const mapObj  = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (mapObj.current) return;

    const lat = parseFloat(initialLat) || -7.3274;
    const lng = parseFloat(initialLng) || 108.3437;

    mapObj.current = L.map(mapRef.current).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapObj.current);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(mapObj.current);
    markerRef.current = marker;

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      setCoords({ lat: lat.toFixed(8), lng: lng.toFixed(8) });
    });

    mapObj.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCoords({ lat: lat.toFixed(8), lng: lng.toFixed(8) });
    });

    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, []);

  const handleConfirm = () => {
    if (onPick) onPick({ lat: coords.lat, lng: coords.lng });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Klik pada peta atau geser marker untuk memilih koordinat lokasi.</p>

      <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 380 }} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Latitude</label>
          <input readOnly className="input font-mono text-xs bg-gray-50" value={coords.lat} />
        </div>
        <div>
          <label className="label">Longitude</label>
          <input readOnly className="input font-mono text-xs bg-gray-50" value={coords.lng} />
        </div>
      </div>

      <button type="button" onClick={handleConfirm} className="btn-primary w-full justify-center">
        Gunakan Koordinat Ini
      </button>
    </div>
  );
}
