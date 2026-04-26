import clsx from "clsx";

export default function ReferenceCard({ character, morse, category, dense = false }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 hover:bg-white/[0.08]",
        dense ? "px-4 py-3" : "px-5 py-4",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-semibold">{character}</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
          {category}
        </span>
      </div>
      <p className="mt-3 font-mono tracking-[0.26em] accent-text">{morse}</p>
    </div>
  );
}
