import { RadioTower, ChevronRight, Moon, Sun } from 'lucide-react';
import { fmtCurrency } from '../lib/sms';

export default function Header({
  balance,
  pending,
  theme,
  onToggleTheme,
}: {
  balance: number;
  pending: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-signal text-bg shadow-[0_0_24px_-6px_var(--color-signal)]">
            <RadioTower size={18} strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-bold tracking-tight">NAKRIS 02 ENTERPRISES SMS Campaign Dashboard</h1>
            <div className="hidden text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
              SMS Campaigns
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1.5 text-sm text-muted md:flex">
          <span>Campaigns</span>
          <ChevronRight size={14} className="text-faint" />
          <span>Current</span>
          <ChevronRight size={14} className="text-faint" />
          <span className="text-fg">Payday Flash Sale</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
            <span className="live-dot" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-signal">LIVE</span>
            <span className="hidden font-mono text-[11px] text-muted sm:inline">· {pending} in flight</span>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[10px] uppercase tracking-wider text-muted">Balance</div>
            <div className="font-mono text-sm tabular-nums">{fmtCurrency(balance)}</div>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-2 text-muted transition hover:border-line-strong hover:text-fg"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
