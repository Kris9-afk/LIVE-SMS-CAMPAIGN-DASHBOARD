import { useId } from 'react';
import { SendHorizontal, CircleCheck, CircleX, Wallet, type LucideIcon } from 'lucide-react';
import type { Stats, HourBucket } from '../lib/stats';
import { COST_PER_SEGMENT, fmtCurrency } from '../lib/sms';
import Reveal from './Reveal';

type Tone = 'signal' | 'ok' | 'bad' | 'warn';

const TONES: Record<Tone, { text: string; bg: string; stroke: string; bar: string }> = {
  signal: { text: 'text-signal', bg: 'bg-signal/10', stroke: '#c6ff4a', bar: 'from-signal/60' },
  ok: { text: 'text-ok', bg: 'bg-ok/10', stroke: '#5be49b', bar: 'from-ok/60' },
  bad: { text: 'text-bad', bg: 'bg-bad/10', stroke: '#ff6a6a', bar: 'from-bad/60' },
  warn: { text: 'text-warn', bg: 'bg-warn/10', stroke: '#ffb347', bar: 'from-warn/60' },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = useId().replace(/:/g, '');
  const max = Math.max(1, ...data);
  const n = Math.max(1, data.length - 1);
  const pts = data.map((v, i) => `${(i / n) * 100},${30 - (v / max) * 26}`);
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-9 w-full" aria-hidden>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,32 ${pts.join(' ')} 100,32`} fill={`url(#g-${id})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  series,
  index,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  series: number[];
  index: number;
}) {
  const t = TONES[tone];
  return (
    <Reveal i={index + 1} className="h-full">
      <div className="card group relative h-full overflow-hidden p-5 transition-colors hover:border-line-strong">
        <div
          className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${t.bar} via-transparent to-transparent`}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</div>
          <div className={`grid h-8 w-8 place-items-center rounded-lg ${t.bg} ${t.text}`}>
            <Icon size={15} strokeWidth={2.25} />
          </div>
        </div>
        <div className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight sm:text-[2rem]">
          {value}
        </div>
        <div className="mt-1 text-xs text-muted">{sub}</div>
        <div className="mt-4 opacity-80 transition-opacity group-hover:opacity-100">
          <Sparkline data={series} color={t.stroke} />
        </div>
      </div>
    </Reveal>
  );
}

export default function StatsGrid({ stats, hourly }: { stats: Stats; hourly: HourBucket[] }) {
  const resolved = stats.delivered + stats.failed;
  const failRate = resolved ? (stats.failed / resolved) * 100 : 0;

  const cards: Array<{
    label: string;
    value: string;
    sub: string;
    icon: LucideIcon;
    tone: Tone;
    series: number[];
  }> = [
    {
      label: 'Total Sent',
      value: stats.total.toLocaleString('en-US'),
      sub: `${stats.pending} in flight · ${resolved} resolved`,
      icon: SendHorizontal,
      tone: 'signal',
      series: hourly.map((h) => h.total),
    },
    {
      label: 'Delivered',
      value: stats.delivered.toLocaleString('en-US'),
      sub: `${(stats.deliveryRate * 100).toFixed(1)}% delivery rate`,
      icon: CircleCheck,
      tone: 'ok',
      series: hourly.map((h) => h.delivered),
    },
    {
      label: 'Failed',
      value: stats.failed.toLocaleString('en-US'),
      sub: `${failRate.toFixed(1)}% failure rate`,
      icon: CircleX,
      tone: 'bad',
      series: hourly.map((h) => h.failed),
    },
    {
      label: 'Total Cost',
      value: fmtCurrency(stats.cost),
      sub: `${stats.segments.toLocaleString('en-US')} segments · ${fmtCurrency(COST_PER_SEGMENT, true)} each`,
      icon: Wallet,
      tone: 'warn',
      series: hourly.map((h) => h.cost),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c, i) => (
        <StatCard key={c.label} {...c} index={i} />
      ))}
    </div>
  );
}
