import { useEffect, useState } from 'react';
import logo from './assets/logo.png';

import NavTabs from './components/NavTabs';
import AdsPage from './pages/AdsPage';
import Ga4OverviewPage from './pages/Ga4OverviewPage';
import Ga4AcquisitionPage from './pages/Ga4AcquisitionPage';
import Ga4PagesPage from './pages/Ga4PagesPage';

const TABS = [
  { key: 'ads', label: 'Facebook Ads', Component: AdsPage },
  { key: 'ga4-overview', label: 'Panoramica traffico', Component: Ga4OverviewPage },
  { key: 'ga4-acquisition', label: 'Acquisizione', Component: Ga4AcquisitionPage },
  { key: 'ga4-pages', label: 'Pagine più visitate', Component: Ga4PagesPage },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('ads');
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-[var(--brand)] bg-[var(--surface-1)] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Tenuta Macconi" className="h-10 w-auto" />
            <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />
            <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Marketing Dashboard <span className="text-[var(--brand)]">·</span> Tenuta Macconi
            </h1>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
          >
            {dark ? '☀️ Chiaro' : '🌙 Scuro'}
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <NavTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {TABS.map(({ key, Component }) => (
          <div key={key} className={key === activeTab ? '' : 'hidden'}>
            <Component />
          </div>
        ))}
      </main>
    </div>
  );
}
