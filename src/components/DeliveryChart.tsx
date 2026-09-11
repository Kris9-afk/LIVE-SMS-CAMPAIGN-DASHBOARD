import type { HourBucket, Stats } from '../lib/stats';

function RateRing({ rate, delivered, failed }: { rate: number; delivered: number; failed: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = c * Math.min(1, Math.max(0, rate));
  return (
    <div className="flex items-center gap-4 sm:flex-col sm:gap-2 sm:w-40">
      <div className="text-center">
        <div className="font-sans text-[8.5px] uppercase tracking-[0.18em] text-muted">Delivery rate</div>
      </div>
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        <circle cx="60" cy="60" r={r} stroke="var(--color-line)" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={r}
          stroke="var(--color-ok)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
        <circle cx="60" cy="60" r="32" fill="var(--color-surface-2)" />
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fill="var(--color-fg)"
          fontSize="21"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          {(rate * 100).toFixed(1)}%
        </text>
      </svg>
      <div className="text-xs text-muted sm:text-center">
        <div>
          <span className="font-mono text-ok">{delivered}</span> delivered
        </div>
        <div>
          <span className="font-mono text-bad">{failed}</span> failed
        </div>
      </div>
    </div>
  );
}

export default function DeliveryChart({ hourly, stats }: { hourly: HourBucket[]; stats: Stats }) {
  const max = Math.max(1, ...hourly.map((h) => h.total));

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Delivery timeline</h2>
          <p className="mt-0.5 text-xs text-muted">Messages per hour · last 12 hours</p>
        </div>
        <ul className="flex items-center gap-4 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-ok" /> Delivered
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-bad" /> Failed
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-warn" /> Pending
          </li>
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex h-40 items-end gap-1.5 sm:gap-2">
            {hourly.map((h) => {
              const pct = h.total ? Math.max(4, (h.total / max) * 100) : 0;
              return (
                <div key={h.start} className="group relative h-full flex-1">
                  <div className="absolute inset-x-0 bottom-0 top-0 rounded-[3px] bg-line/30" />
                  <div
                    className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[3px] transition-[height] duration-500"
                    style={{ height: `${pct}%` }}
                  >
                    <div style={{ flex: h.pending }} className="bg-warn" />
                    <div style={{ flex: h.failed }} className="bg-bad" />
                    <div style={{ flex: h.delivered }} className="bg-ok" />
                  </div>
                  <div className="pointer-events-none absolute left-1/2 top-0 z-10 w-36 -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-lg border border-line bg-surface-2 p-2.5 text-[11px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    <div className="mb-1 font-mono text-muted">
                      {h.label} · {h.total} sent
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ok">Delivered</span>
                      <span className="font-mono">{h.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bad">Failed</span>
                      <span className="font-mono">{h.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warn">Pending</span>
                      <span className="font-mono">{h.pending}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5 sm:gap-2">
            {hourly.map((h, i) => (
              <div key={h.start} className="flex-1 text-center font-mono text-[10px] text-faint">
                {i % 2 === 1 ? h.label : ''}
              </div>
            ))}
          </div>
        </div>
        <RateRing rate={stats.deliveryRate} delivered={stats.delivered} failed={stats.failed} />
      </div>
    </section>
  );
}
