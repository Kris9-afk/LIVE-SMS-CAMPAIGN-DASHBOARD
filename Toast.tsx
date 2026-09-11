import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, X } from 'lucide-react';

export interface ToastData {
  id: number;
  title: string;
  body: string;
}

export default function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-96">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="card pointer-events-auto flex items-start gap-3 border-signal/30 p-4 shadow-[0_20px_50px_-20px_rgba(198,255,74,0.35)]"
            role="status"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-signal/15 text-signal">
              <CircleCheck size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display font-semibold">{toast.title}</div>
              <div className="mt-0.5 text-sm text-muted">{toast.body}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-faint hover:bg-surface-2 hover:text-fg"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
