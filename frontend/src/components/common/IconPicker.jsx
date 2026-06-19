import { useState } from 'react';
import * as Icons from 'lucide-react';

const ICON_LIST = [
  'map-pin', 'store', 'shopping-bag', 'shopping-cart', 'shopping-basket',
  'briefcase', 'building', 'building-2', 'home', 'warehouse',
  'graduation-cap', 'book-open', 'book', 'library', 'school',
  'heart-pulse', 'stethoscope', 'pill', 'hospital', 'ambulance',
  'utensils', 'coffee', 'beer', 'wine', 'cake',
  'hotel', 'tent', 'tree-pine', 'mountain', 'sun',
  'church', 'mosque', 'temple',
  'gas-station', 'car', 'bus', 'train', 'plane',
  'parking-circle', 'parking-square',
  'banknote', 'credit-card', 'landmark', 'bank',
  'palette', 'camera', 'music', 'film', 'theater',
  'dumbbell', 'swimming', 'bike', 'football', 'trophy',
  'baby', 'dog', 'cat', 'paw-print', 'leaf',
  'wifi', 'smartphone', 'printer', 'monitor', 'hard-drive',
  'star', 'heart', 'flag', 'shield', 'award',
  'globe', 'compass', 'navigation', 'map', 'waypoints',
  'trash-2', 'recycle', 'droplet', 'zap', 'flame',
  'cloud', 'cloud-sun', 'cloud-rain', 'snowflake', 'wind',
  'sunrise', 'sunset', 'moon',
];



export default function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = ICON_LIST.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="input text-sm mb-2"
        placeholder="Cari ikon..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 rounded-xl border border-gray-200/60 bg-white/50">
        {filtered.map(name => {
          const pascal = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
          const IconComp = Icons[pascal];
          if (!IconComp) return null;
          const active = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`flex items-center justify-center w-full aspect-square rounded-lg transition-all ${
                active
                  ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-400 scale-110'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              title={name}
            >
              <IconComp size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
