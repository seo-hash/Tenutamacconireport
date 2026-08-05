import { useState, useRef, useEffect } from 'react';

export default function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };

  const label = selected.length === 0 ? placeholder : `${selected.length} selezionate`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-left text-sm text-[var(--text-primary)]"
      >
        {label}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full min-w-[220px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-1)] shadow-lg">
          {options.length === 0 && <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">Nessuna opzione</div>}
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              <span className="truncate text-[var(--text-primary)]">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
