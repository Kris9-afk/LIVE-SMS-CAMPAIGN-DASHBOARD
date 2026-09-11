import { useMemo, useState, type FormEvent } from 'react';
import { Send, Link2, ShieldOff, TriangleAlert, LoaderCircle, MessageSquarePlus } from 'lucide-react';
import {
  COST_PER_SEGMENT,
  MAX_MESSAGE_LENGTH,
  SEGMENT_LENGTH,
  fmtCurrency,
  parseRecipients,
  segmentInfo,
} from '../lib/sms';
import type { SendPayload } from '../lib/types';

const DEFAULT_RECIPIENTS = '+233 24 400 1199\n+233 50 210 4471\n055 812 0033';

export default function CampaignForm({ onSend }: { onSend: (p: SendPayload) => void }) {
  const [campaign, setCampaign] = useState('Payday Flash Sale — Wave 2');
  const [sender, setSender] = useState('ADINKRA');
  const [recipientsRaw, setRecipientsRaw] = useState(DEFAULT_RECIPIENTS);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);

  const recipients = useMemo(() => parseRecipients(recipientsRaw), [recipientsRaw]);
  const info = useMemo(() => segmentInfo(message), [message]);

  const estCost = info.segments * recipients.valid.length * COST_PER_SEGMENT;
  const canSend = info.length > 0 && recipients.valid.length > 0 && !sending;
  const barCount = Math.max(1, info.segments);

  const append = (snippet: string) =>
    setMessage((m) => {
      const base = m.trimEnd();
      return (base ? `${base} ${snippet}` : snippet).slice(0, MAX_MESSAGE_LENGTH);
    });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSend) return;
    setSending(true);
    window.setTimeout(() => {
      onSend({
        campaign: campaign.trim() || 'Untitled campaign',
        sender: sender.trim() || 'ADINKRA',
        message: message.trim(),
        recipients: recipients.valid,
      });
      setMessage('');
      setSending(false);
      setTouched(false);
    }, 650);
  };

  const segmentTone =
    info.segments === 0
      ? 'bg-line text-muted'
      : info.segments === 1
        ? 'bg-signal/15 text-signal'
        : 'bg-warn/15 text-warn';

  return (
    <section className="card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Send new campaign</h2>
          <p className="mt-0.5 text-xs text-muted">Compose a broadcast · {SEGMENT_LENGTH} characters per SMS</p>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal/10 text-signal">
          <MessageSquarePlus size={18} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-1 flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px]">
          <label className="block">
            <span className="label">Campaign title</span>
            <input
              className="field"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. Payday Flash Sale"
              maxLength={60}
            />
          </label>
          <label className="block">
            <span className="label">Sender ID</span>
            <input
              className="field font-mono"
              value={sender}
              maxLength={11}
              onChange={(e) => setSender(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="BRAND"
            />
          </label>
        </div>

        <label className="block">
          <span className="flex items-center justify-between">
            <span className="label">Recipients</span>
            <span className="mb-1.5 font-mono text-[11px] text-muted">
              {recipients.valid.length} valid
              {recipients.invalid.length > 0 && (
                <span className="text-bad"> · {recipients.invalid.length} invalid</span>
              )}
            </span>
          </span>
          <textarea
            className="field resize-none font-mono text-xs leading-relaxed"
            rows={3}
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            placeholder={'+233 24 123 4567 or 024 123 4567\nOne per line, or comma-separated'}
            spellCheck={false}
          />
        </label>

        <div>
          <div className="flex items-center justify-between">
            <span className="label">Message</span>
            <div className="mb-1.5 flex gap-1.5">
              <button type="button" className="chip" onClick={() => append('https://nakris02.gh/p30')}>
                <Link2 size={12} /> Link
              </button>
              <button type="button" className="chip" onClick={() => append('Reply STOP to opt out')}>
                <ShieldOff size={12} /> Opt-out
              </button>
            </div>
          </div>
          <textarea
            className="field resize-none leading-relaxed"
            rows={5}
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Akwaaba! Our payday sale is live — 30% off everything for 48 hours, pay with MoMo…"
          />

          <div className="mt-3 rounded-xl border border-line bg-bg/50 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="font-mono leading-none">
                <span
                  className={`text-3xl font-semibold tabular-nums transition-colors ${
                    info.length > SEGMENT_LENGTH ? 'text-warn' : 'text-fg'
                  }`}
                >
                  {info.length}
                </span>
                <span className="ml-1.5 text-sm text-muted">/ {barCount * SEGMENT_LENGTH} chars</span>
              </div>
              <div
                className={`rounded-lg px-2.5 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors ${segmentTone}`}
                aria-live="polite"
              >
                {info.segments} SMS
              </div>
            </div>

            <div className="mt-3 flex gap-1">
              {Array.from({ length: barCount }, (_, i) => {
                const fill = Math.min(1, Math.max(0, (info.length - i * SEGMENT_LENGTH) / SEGMENT_LENGTH));
                return (
                  <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full transition-[width] duration-200 ${
                        i === 0 ? 'bg-signal' : 'bg-warn'
                      }`}
                      style={{ width: `${fill * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>
                {info.segments === 0
                  ? `${SEGMENT_LENGTH} characters = 1 SMS`
                  : `${info.remaining} left in segment ${info.segments}`}
              </span>
              {info.unicode ? (
                <span className="inline-flex items-center gap-1 text-warn">
                  <TriangleAlert size={12} /> Unicode detected
                </span>
              ) : (
                <span className="font-mono text-faint">GSM-7</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line-strong p-4">
          <div className="text-xs leading-relaxed text-muted">
            <span className="font-mono text-fg">{info.segments}</span> SMS ×{' '}
            <span className="font-mono text-fg">{recipients.valid.length}</span> recipient
            {recipients.valid.length === 1 ? '' : 's'} ×{' '}
            <span className="font-mono text-fg">{fmtCurrency(COST_PER_SEGMENT, true)}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-faint">Est. cost</div>
            <div className="font-mono text-lg font-semibold tabular-nums">{fmtCurrency(estCost, true)}</div>
          </div>
        </div>

        {touched && !canSend && !sending && (
          <p className="text-xs text-bad">
            {info.length === 0 ? 'Write a message before sending.' : 'Add at least one valid phone number.'}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSend}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-3 font-display font-bold text-bg transition hover:bg-[#d4ff6a] hover:shadow-[0_0_28px_-8px_var(--color-signal)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
        >
          {sending ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Handing off to gateway…
            </>
          ) : (
            <>
              <Send size={16} /> Send to {recipients.valid.length} recipient
              {recipients.valid.length === 1 ? '' : 's'}
            </>
          )}
        </button>
      </form>
    </section>
  );
}
