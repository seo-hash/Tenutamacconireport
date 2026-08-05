export default function NavTabs({ tabs, active, onChange }) {
  return (
    <nav className="flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--brand)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
