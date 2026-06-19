import { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onClose={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const icons = {
    success: <CheckCircle size={16} className="text-green-500 flex-shrink-0" />,
    error:   <XCircle    size={16} className="text-red-500   flex-shrink-0" />,
    warning: <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />,
  };
  const border = {
    success: 'border-emerald-100',
    error:   'border-red-100',
    warning: 'border-amber-100',
  };

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg ${border[toast.type]}`}
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(229, 231, 235, 0.6)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {icons[toast.type]}
      <p className="text-sm text-gray-700 flex-1 font-medium">{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
