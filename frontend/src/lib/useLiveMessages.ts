import { useCallback, useEffect, useState } from 'react';
import seedRaw from '../data/messages.json';
import type { SendPayload, SmsMessage, Status } from './types';
import { charCount, costFor, countSegments } from './sms';

interface SeedMessage {
  id: string;
  name: string;
  recipient: string;
  carrier: string;
  campaign: string;
  message: string;
  status: Status;
  minutesAgo: number;
  failReason?: string;
}

const seed = seedRaw as unknown as SeedMessage[];

const MAX_MESSAGES = 180;
const MIN_PENDING_AGE_MS = 3_000;
const RESOLVE_EVERY_MS = 2_400;
const TRICKLE_EVERY_MS = 5_200;

const FAIL_REASONS = [
  'Carrier rejected (DND list)',
  'Handset unreachable',
  'Invalid destination number',
  'Filtered by carrier (NCA rule)',
  'Recipient opted out',
  'Queue timeout at carrier',
];

const FIRST = [
  'Ama', 'Kofi', 'Akosua', 'Kwame', 'Abena', 'Yaw', 'Efua', 'Kwabena', 'Adwoa', 'Kojo', 'Esi', 'Fiifi',
  'Selorm', 'Dzifa', 'Kwesi', 'Afia', 'Elikem', 'Zainab', 'Fuseini', 'Mawuli', 'Nana', 'Ebo', 'Maame',
];
const LAST = [
  'Mensah', 'Boateng', 'Owusu', 'Asante', 'Darko', 'Appiah', 'Agyeman', 'Osei', 'Acheampong',
  'Quaye', 'Tetteh', 'Amoah', 'Ankrah', 'Addo', 'Agbodza', 'Annan', 'Frimpong', 'Alhassan',
];
const CARRIERS = ['MTN', 'Telecel', 'AirtelTigo'];

const PREFIXES: Record<string, string> = {
  '24': 'MTN', '54': 'MTN', '55': 'MTN', '59': 'MTN',
  '20': 'Telecel', '50': 'Telecel',
  '26': 'AirtelTigo', '27': 'AirtelTigo', '56': 'AirtelTigo', '57': 'AirtelTigo',
};

export function carrierFor(recipient: string): string {
  const d = recipient.replace(/\D/g, '');
  const prefix = d.startsWith('233') ? d.slice(3, 5) : d.slice(1, 3);
  return PREFIXES[prefix] ?? pick(CARRIERS);
}

const TEMPLATE = (first: string) =>
  `Hi ${first}! Payday Flash Sale is LIVE: 30% off everything for 48 hrs. Use code PAYDAY30 at checkout. Shop: https://nakris02.gh/p30 Reply STOP to opt out`;
const CAMPAIGN_LINK = 'https://nakris02.gh/p30';

let counter = 2000;
const nextId = () => `msg_${counter++}`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefix = pick(Object.keys(PREFIXES));
  const mid = 100 + Math.floor(Math.random() * 900);
  const line = 1000 + Math.floor(Math.random() * 9000);
  return `+233 ${prefix} ${mid} ${line}`;
}

export function nameFor(recipient: string): string {
  const digits = recipient.replace(/\D/g, '');
  let h = 0;
  for (const c of digits) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${FIRST[h % FIRST.length]} ${LAST[(h >>> 5) % LAST.length]}`;
}

function hydrate(): SmsMessage[] {
  const now = Date.now();
  return seed.map((s) => {
    const segments = countSegments(charCount(s.message));
    const sentAt = now - s.minutesAgo * 60_000;
    return {
      id: s.id,
      name: s.name,
      recipient: s.recipient,
      carrier: s.carrier,
      campaign: s.campaign,
      message: s.message.replace('https://adnk.gh/p30', CAMPAIGN_LINK),
      status: s.status,
      sentAt,
      updatedAt: s.status === 'Pending' ? sentAt : sentAt + 1_800,
      segments,
      cost: costFor(segments),
      failReason: s.failReason,
    };
  });
}

function buildMessage(
  partial: { name: string; recipient: string; carrier?: string; campaign: string; message: string },
  sentAt = Date.now(),
): SmsMessage {
  const segments = countSegments(charCount(partial.message));
  return {
    id: nextId(),
    name: partial.name,
    recipient: partial.recipient,
    carrier: partial.carrier ?? carrierFor(partial.recipient),
    campaign: partial.campaign,
    message: partial.message,
    status: 'Pending',
    sentAt,
    updatedAt: sentAt,
    segments,
    cost: costFor(segments),
  };
}

function randomOutbound(): SmsMessage {
  const first = pick(FIRST);
  return buildMessage({
    name: `${first} ${pick(LAST)}`,
    recipient: randomPhone(),
    campaign: 'Payday Flash Sale',
    message: TEMPLATE(first),
  });
}

export function useLiveMessages() {
  const [messages, setMessages] = useState<SmsMessage[]>(hydrate);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      setMessages((prev) => {
        const eligible = prev.filter((m) => m.status === 'Pending' && t - m.sentAt > MIN_PENDING_AGE_MS);
        if (eligible.length === 0) return prev;
        const target = pick(eligible);
        const ok = Math.random() < 0.9;
        const status: Status = ok ? 'Delivered' : 'Failed';
        return prev.map((m) =>
          m.id === target.id
            ? { ...m, status, updatedAt: t, failReason: ok ? undefined : pick(FAIL_REASONS) }
            : m,
        );
      });
    }, RESOLVE_EVERY_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() > 0.55) return;
      setMessages((prev) => (prev.length >= MAX_MESSAGES ? prev : [randomOutbound(), ...prev]));
    }, TRICKLE_EVERY_MS);
    return () => window.clearInterval(id);
  }, []);

  const send = useCallback((payload: SendPayload) => {
    const t = Date.now();
    const batch = payload.recipients.map((recipient, i) =>
      buildMessage(
        { name: nameFor(recipient), recipient, campaign: payload.campaign, message: payload.message },
        t - i,
      ),
    );
    setMessages((prev) => [...batch, ...prev]);
    return batch.length;
  }, []);

  return { messages, send, now };
}
