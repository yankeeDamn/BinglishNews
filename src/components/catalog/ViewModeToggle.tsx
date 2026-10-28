"use client";
export type ViewMode = "grid" | "compact" | "bento";
export default function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return <div role="group" aria-label="Story layout" className="inline-flex rounded-full border border-line bg-surface p-1">{([['grid','Grid'],['compact','Wire'],['bento','Digest']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => onChange(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === value ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>{label}</button>)}</div>;
}
