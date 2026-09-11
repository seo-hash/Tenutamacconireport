const REFERRAL_DOMAINS = [
  'facebook.com',
  'm.facebook.com',
  'l.facebook.com',
  'lm.facebook.com',
  'instagram.com',
  'l.instagram.com',
];

export default function Ga4ReferralWatchlist() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <h3 className="mb-1 text-sm font-semibold text-[var(--text-primary)]">
        Domini referral Meta da escludere in GA4
      </h3>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        Questi domini generano referral self-referencing quando gli utenti tornano dall'app Facebook/Instagram, gonfiando le
        sessioni "Referral" e disallineando i dati rispetto a Meta Ads Manager. Vanno aggiunti manualmente in{' '}
        <strong>GA4 Admin → Data Streams → Configura impostazioni tag → Mostra altro → Elenco referral esclusi</strong>.
      </p>
      <div className="flex flex-wrap gap-2">
        {REFERRAL_DOMAINS.map((domain) => (
          <span
            key={domain}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-mono text-[var(--text-primary)]"
          >
            {domain}
          </span>
        ))}
      </div>
    </div>
  );
}
