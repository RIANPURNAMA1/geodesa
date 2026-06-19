import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page, from, to, total } = meta;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100/50">
      <p className="text-sm text-gray-400 font-medium">
        Menampilkan {from}–{to} dari {total} data
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 rounded-xl text-gray-400 hover:bg-black/5 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(last_page, 7) }, (_, i) => {
          let page;
          if (last_page <= 7) {
            page = i + 1;
          } else if (current_page <= 4) {
            page = i + 1;
          } else if (current_page >= last_page - 3) {
            page = last_page - 6 + i;
          } else {
            page = current_page - 3 + i;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-xl text-sm font-bold transition-all ${
                page === current_page
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:bg-black/5'
              }`}
              style={page === current_page ? {
                background: 'linear-gradient(135deg, #059669, #10B981)',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
              } : {}}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 rounded-xl text-gray-400 hover:bg-black/5 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
