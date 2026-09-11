import { useEffect, useMemo, useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react';
import type { SmsMessage, Status } from '../lib/types';
import StatusBadge from './StatusBadge';
import { fmtClock, fmtCurrency, timeAgo } from '../lib/sms';

type Filter = 'All' | Status;
const FILTERS: Filter[] = ['All', 'Delivered', 'Pending', 'Failed'];
const PAGE_SIZE = 8;

const FILTER_ACTIVE: Record<Filter, string> = {
  All: 'bg-fg text-bg border-fg',
  Delivered: 'bg-ok/15 text-ok border-ok/30',
  Pending: 'bg-warn/15 text-warn border-warn/30',
  Failed: 'bg-bad/15 text-bad border-bad/30',
};

export default function MessagesTable({ messages, now }: { messages: SmsMessage[]; now: number }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [query, filter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { All: messages.length, Delivered: 0, Pending: 0, Failed: 0 };
    for (const m of messages) c[m.status]++;
    return c;
  }, [messages]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const digits = needle.replace(/\D/g, '');
    return messages
      .filter((m) => {
        if (filter !== 'All' && m.status !== filter) return false;
        if (!needle) return true;
        return (
          m.name.toLowerCase().includes(needle) ||
          m.message.toLowerCase().includes(needle) ||
          m.campaign.toLowerCase().includes(needle) ||
          m.carrier.toLowerCase().includes(needle) ||
          m.id.toLowerCase().includes(needle) ||
          (digits.length > 0 && m.recipient.replace(/\D/g, '').includes(digits))
        );
      })
      .sort((a, b) => b.sentAt - a.sentAt);
  }, [messages, query, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, safePage * PAGE_SIZE);

  const exportCsv = () => {
    const header = [
      'id', 'name', 'recipient', 'carrier', 'campaign', 'status', 'segments', 'cost_usd', 'sent_at', 'message', 'fail_reason',
    ];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...filtered.map((m) =>
        [
          m.id, m.name, m.recipient, m.carrier, m.campaign, m.status, m.segments, m.cost.toFixed(4),
          new Date(m.sentAt).toISOString(), m.message, m.failReason ?? '',
        ]
          .map(esc)
          .join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relay-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">Sent messages</h2>
            <p className="mt-0.5 text-xs text-muted">
              <span className="font-mono text-fg">{filtered.length}</span> of{' '}
              <span className="font-mono">{messages.length}</span> messages
              {query && (
                <>
                  {' '}matching <span className="text-fg">“{query}”</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs font-medium text-muted transition hover:border-line-strong hover:text-fg disabled:opacity-40"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              className="field search-field pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, message, campaign…"
              aria-label="Search messages"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-faint hover:bg-surface-2 hover:text-fg"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Filter by status">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active ? FILTER_ACTIVE[f] : 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-fg'
                  }`}
                >
                  {f}
                  <span className={`font-mono tabular-nums ${active ? 'opacity-80' : 'text-faint'}`}>{counts[f]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
            <Inbox size={22} />
          </div>
          <p className="font-display font-semibold">No messages match</p>
          <p className="max-w-xs text-sm text-muted">Try a different search term or clear the status filter.</p>
          {(query || filter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('All');
              }}
              className="mt-2 text-sm text-signal hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-6 py-3 font-medium">Recipient</th>
                  <th className="px-3 py-3 font-medium">Message</th>
                  <th className="px-3 py-3 font-medium">Campaign</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Cost</th>
                  <th className="px-6 py-3 text-right font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="row-in border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2/50">
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{m.name}</div>
                      <div className="font-mono text-xs text-muted">
                        {m.recipient} <span className="text-faint">· {m.carrier}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="max-w-[300px] truncate text-muted xl:max-w-[420px]" title={m.message}>
                        {m.message}
                      </p>
                      {m.failReason && <p className="mt-0.5 text-xs text-bad">{m.failReason}</p>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{m.campaign}</td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-mono tabular-nums">
                      {fmtCurrency(m.cost, true)}
                      <div className="text-[11px] text-faint">
                        {m.segments} seg{m.segments === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono text-xs tabular-nums">
                      <div>{fmtClock(m.sentAt)}</div>
                      <div className="text-faint">{timeAgo(m.sentAt, now)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line/60 md:hidden">
            {rows.map((m) => (
              <li key={m.id} className="row-in flex flex-col gap-2.5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{m.name}</div>
                    <div className="truncate font-mono text-xs text-muted">{m.recipient}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <p className="line-clamp-2 text-sm text-muted">{m.message}</p>
                {m.failReason && <p className="text-xs text-bad">{m.failReason}</p>}
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-faint">
                  <span className="truncate">{m.campaign}</span>
                  <span className="shrink-0">
                    {fmtCurrency(m.cost, true)} · {timeAgo(m.sentAt, now)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-muted sm:px-6">
            <span className="font-mono tabular-nums">
              {from}–{to} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface-2 transition hover:border-line-strong hover:text-fg disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="px-2 font-mono tabular-nums">
                {safePage} / {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={safePage >= pages}
                aria-label="Next page"
                className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface-2 transition hover:border-line-strong hover:text-fg disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
