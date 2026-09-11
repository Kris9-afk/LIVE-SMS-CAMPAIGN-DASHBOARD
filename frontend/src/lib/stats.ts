import type { SmsMessage } from './types';

export interface Stats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  cost: number;
  segments: number;
  deliveryRate: number;
}

export function computeStats(messages: SmsMessage[]): Stats {
  let delivered = 0;
  let failed = 0;
  let pending = 0;
  let cost = 0;
  let segments = 0;
  for (const m of messages) {
    if (m.status === 'Delivered') delivered++;
    else if (m.status === 'Failed') failed++;
    else pending++;
    cost += m.cost;
    segments += m.segments;
  }
  const resolved = delivered + failed;
  return {
    total: messages.length,
    delivered,
    failed,
    pending,
    cost,
    segments,
    deliveryRate: resolved ? delivered / resolved : 0,
  };
}

export interface HourBucket {
  start: number;
  label: string;
  delivered: number;
  failed: number;
  pending: number;
  total: number;
  cost: number;
}

const HOUR = 3_600_000;

export function buildHourly(messages: SmsMessage[], now: number, hours = 12): HourBucket[] {
  const currentStart = Math.floor(now / HOUR) * HOUR;
  const buckets: HourBucket[] = Array.from({ length: hours }, (_, i) => {
    const start = currentStart - (hours - 1 - i) * HOUR;
    const label = new Date(start)
      .toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
      .replace(/\s/g, '')
      .toLowerCase();
    return { start, label, delivered: 0, failed: 0, pending: 0, total: 0, cost: 0 };
  });
  const first = buckets[0].start;
  for (const m of messages) {
    const idx = Math.floor((m.sentAt - first) / HOUR);
    if (idx < 0 || idx >= hours) continue;
    const b = buckets[idx];
    b.total++;
    b.cost += m.cost;
    if (m.status === 'Delivered') b.delivered++;
    else if (m.status === 'Failed') b.failed++;
    else b.pending++;
  }
  return buckets;
}
