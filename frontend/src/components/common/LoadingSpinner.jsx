export default function LoadingSpinner({ text = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'linear-gradient(135deg, #f0f4f0 0%, #e8efe8 50%, #f0f4f0 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400 font-semibold tracking-wide">Memuat aplikasi...</p>
      </div>
    </div>
  );
}
