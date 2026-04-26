import clsx from "clsx";
import { MORSE_ENTRIES } from "../utils/morse";

export default function MorseGrid({ activeMatches = [], currentBuffer = "" }) {
  const activeSet = new Set(activeMatches);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {MORSE_ENTRIES.map((entry, index) => {
        const isActive = activeSet.has(entry.character);
        const isExact = currentBuffer && entry.morse === currentBuffer;

        return (
          <div
            key={entry.character}
            className={clsx(
              "animate-rise-in rounded-2xl border px-4 py-3 transition duration-300",
              isExact &&
                "border-emerald-300/40 bg-emerald-400/15 shadow-lg shadow-emerald-950/30",
              !isExact &&
                isActive &&
                "border-cyan-300/35 bg-cyan-400/10 shadow-lg shadow-cyan-950/20",
              !isExact &&
                !isActive &&
                "border-white/8 bg-white/[0.03] text-[rgb(var(--muted))]",
            )}
            style={{ animationDelay: `${index * 8}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xl font-semibold">{entry.character}</span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
                {entry.category}
              </span>
            </div>
            <p className="mt-3 break-all font-mono text-sm tracking-[0.24em]">
              {entry.morse}
            </p>
          </div>
        );
      })}
    </div>
  );
}
