import type { Status } from '../lib/types';

const STYLES: Record<Status, { wrap: string; dot: string }> = {
  Delivered: { wrap: 'text-ok bg-ok/10 border-ok/20', dot: 'bg-ok' },
  Pending: { wrap: 'text-warn bg-warn/10 border-warn/20', dot: 'bg-warn animate-pulse' },
  Failed: { wrap: 'text-bad bg-bad/10 border-bad/20', dot: 'bg-bad' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
