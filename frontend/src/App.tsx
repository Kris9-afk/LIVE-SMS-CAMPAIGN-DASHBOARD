import { useCallback, useEffect, useMemo, useState } from 'react';
import { Zap } from 'lucide-react';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import CampaignForm from './components/CampaignForm';
import DeliveryChart from './components/DeliveryChart';
import LiveFeed from './components/LiveFeed';
import MessagesTable from './components/MessagesTable';
import Toast, { type ToastData } from './components/Toast';
import Reveal from './components/Reveal';
import { useLiveMessages } from './lib/useLiveMessages';
import { buildHourly, computeStats } from './lib/stats';
import type { SendPayload } from './lib/types';

const STARTING_BALANCE = 1500;

export default function App() {
  const { messages, send, now } = useLiveMessages();
  const stats = useMemo(() => computeStats(messages), [messages]);
  const hourly = useMemo(() => buildHourly(messages, now), [messages, now]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('nakris-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('nakris-theme', theme);
  }, [theme]);

  const handleSend = useCallback(
    (payload: SendPayload) => {
      const n = send(payload);
      setToast({
        id: Date.now(),
        title: 'Campaign queued',
        body: `${n} message${n === 1 ? '' : 's'} handed to the carrier gateway from ${payload.sender}. Watch them resolve in the feed.`,
      });
    },
    [send],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const today = new Date(now).toLocaleDateString('en-GH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
      <Header
        balance={STARTING_BALANCE - stats.cost}
        pending={stats.pending}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal i={0}>
          <section className="flex flex-col justify-between gap-4 pb-6 pt-8 sm:flex-row sm:items-end sm:pt-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Current campaign</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem]">
                Payday Flash Sale
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                NAKRIS 02 Enterprises · Sender ID <span className="font-mono text-fg">NAKRIS02</span> · Ghana
                numbers (+233) · MTN, Telecel &amp; AirtelTigo
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/25 bg-warn/10 px-3 py-1.5 font-medium text-warn">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warn" />
                {stats.pending} in flight
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/10 px-3 py-1.5 font-medium text-ok">
                <Zap size={12} />
                {(stats.deliveryRate * 100).toFixed(1)}% delivered
              </span>
            </div>
          </section>
        </Reveal>

        <StatsGrid stats={stats} hourly={hourly} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal i={5} className="lg:col-span-5">
            <CampaignForm onSend={handleSend} />
          </Reveal>
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Reveal i={6}>
              <DeliveryChart hourly={hourly} stats={stats} />
            </Reveal>
            <Reveal i={7} className="flex-1">
              <LiveFeed messages={messages} now={now} />
            </Reveal>
          </div>
        </div>

        <Reveal i={8} className="mt-6">
          <MessagesTable messages={messages} now={now} />
        </Reveal>

        <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-xs text-faint sm:flex-row">
          <span>NAKRIS 02 ENTERPRISES SMS Campaign Dashboard</span>
          <span className="font-mono">Rate: GH₵0.035 / segment · GSM-7 · 160 chars per SMS</span>
        </footer>
      </main>

      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}
