export const SEGMENT_LENGTH = 160;
export const COST_PER_SEGMENT = 0.035;
export const MAX_MESSAGE_LENGTH = SEGMENT_LENGTH * 10;

const GSM7_CHARS = new Set(
  (
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
    '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~]|€'
  ).split(''),
);

export function isGsm7(text: string): boolean {
  for (const ch of text) {
    if (!GSM7_CHARS.has(ch)) return false;
  }
  return true;
}

export function charCount(text: string): number {
  return Array.from(text).length;
}

export function countSegments(length: number): number {
  if (length <= 0) return 0;
  return Math.ceil(length / SEGMENT_LENGTH);
}

export interface SegmentInfo {
  length: number;
  segments: number;
  remaining: number;
  unicode: boolean;
}

export function segmentInfo(text: string): SegmentInfo {
  const length = charCount(text);
  const segments = countSegments(length);
  const remaining = segments === 0 ? SEGMENT_LENGTH : segments * SEGMENT_LENGTH - length;
  return { length, segments, remaining, unicode: !isGsm7(text) };
}

export function costFor(segments: number, recipients = 1): number {
  return segments * recipients * COST_PER_SEGMENT;
}

export function fmtCurrency(n: number, precise = false): string {
  return n.toLocaleString('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: precise ? 4 : 2,
  });
}

export function fmtClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function timeAgo(ts: number, now: number): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PHONE_RE = /^\+?[0-9][0-9\s().-]{6,}$/;

export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) digits = `233${digits.slice(1)}`;
  else if (digits.length === 9) digits = `233${digits}`;
  if (digits.length === 12 && digits.startsWith('233')) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return `+${digits}`;
}

export function parseRecipients(raw: string): { valid: string[]; invalid: string[] } {
  const parts = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const part of parts) {
    const digits = part.replace(/\D/g, '');
    if (PHONE_RE.test(part) && digits.length >= 9 && digits.length <= 15) {
      valid.push(formatPhone(part));
    } else {
      invalid.push(part);
    }
  }
  return { valid: Array.from(new Set(valid)), invalid };
}
