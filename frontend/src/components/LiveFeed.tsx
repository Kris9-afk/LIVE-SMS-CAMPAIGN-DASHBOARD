import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck, CircleX, Clock, Activity } from 'lucide-react';
import type { SmsMessage } from '../lib/types';
import { timeAgo } from '../lib/sms';

const ICON = {
  Delivered: { Icon: CircleCheck, cls: 'text-ok bg-ok/10', verb: 'Delivered to' },
  Failed: { Icon: CircleX, cls: 'text-bad bg-bad/10', verb: 'Failed for' },
  Pending: { Icon: Clock, cls: 'text-warn bg-warn/10', verb: 'Queued for' },
} as const;

export default function LiveFeed({ messages, now }: { messages: SmsMessage[]; now: number }) {
  const recent = [...messages].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);

  return (
    <section className="card flex-1 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Gateway events</h2>
          <p className="mt-0.5 text-xs text-muted">Delivery receipts as they arrive</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-signal">
          <Activity size={14} className="animate-pulse" /> streaming
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        <AnimatePresence initial={false} mode="popLayout">
          {recent.map((m) => {
            const { Icon, cls, verb } = ICON[m.status];
            return (
              <motion.li
                key={`${m.id}-${m.status}`}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2/60"
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${cls}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">
                    <span className="text-muted">{verb}</span> <span className="font-medium">{m.name}</span>
                  </div>
                  <div className="truncate font-mono text-[11px] text-faint">
                    {m.recipient} · {m.carrier}
                    {m.failReason ? ` · ${m.failReason}` : ''}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted">{timeAgo(m.updatedAt, now)}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
