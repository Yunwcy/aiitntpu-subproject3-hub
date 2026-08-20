interface ChipOption {
  value: string;
  label: string;
  /** Extra classes applied only while selected — used for member chips so
   * the filter reuses each person's color instead of a flat generic accent. */
  activeClass?: string;
}

interface FilterChipsProps {
  label: string;
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

const DEFAULT_ACTIVE = "bg-brand-600 border-brand-600 text-white";
const INACTIVE =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600";

// A row of toggleable chips standing in for a multi-select filter — click any
// number on at once. No selection in a group means "don't filter on this".
export default function FilterChips({ label, options, selected, onToggle }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-medium text-slate-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              aria-pressed={active}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                active ? opt.activeClass ?? DEFAULT_ACTIVE : INACTIVE
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
