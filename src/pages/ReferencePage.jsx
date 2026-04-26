import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import MorseGrid from "../components/MorseGrid";
import ReferenceCard from "../components/ReferenceCard";
import SectionHeading from "../components/SectionHeading";
import { MORSE_ENTRIES } from "../utils/morse";

const sections = ["Alphabet", "Numbers", "Punctuation"];

export default function ReferencePage() {
  const [query, setQuery] = useState("");

  const filteredEntries = useMemo(() => {
    const rawTerm = query.trim();
    const upperTerm = rawTerm.toUpperCase();
    const compactMorse = rawTerm.replace(/\s+/g, "");

    if (!rawTerm) {
      return MORSE_ENTRIES;
    }

    return MORSE_ENTRIES.filter(
      (entry) =>
        entry.character === upperTerm ||
        entry.character.includes(upperTerm) ||
        entry.morse.includes(compactMorse) ||
        (rawTerm.length > 1 && entry.category.toUpperCase().includes(upperTerm)),
    );
  }, [query]);

  return (
    <section className="pb-8">
      <SectionHeading
        eyebrow="Reference"
        title="Search, scan, and learn the full Morse symbol set."
        description="A responsive reference surface with sticky category headers, instant filtering, and an at-a-glance layout that works equally well on mobile and desktop."
      />

      <div className="panel px-5 py-5 md:px-6">
        <label htmlFor="reference-search" className="text-sm font-medium text-[rgb(var(--muted))]">
          Search characters or Morse
        </label>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            id="reference-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try A, 9, ?, or .-"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-[rgb(var(--text))] outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-cyan-300/40 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {!query.trim() ? (
        <div className="panel mt-6 px-5 py-5 md:px-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Supported characters</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Browse the full symbol set in a dedicated view.
            </p>
          </div>
          <div className="max-h-[34rem] overflow-auto pr-1">
            <MorseGrid activeMatches={MORSE_ENTRIES.map((entry) => entry.character)} />
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {sections.map((section) => {
          const items = filteredEntries.filter((entry) => entry.category === section);
          if (!items.length) {
            return null;
          }

          return (
            <section key={section} className="panel px-5 py-5 md:px-6">
              <div className="sticky top-3 z-10 mb-5 rounded-2xl border border-white/10 bg-[rgb(var(--card-elevated))]/95 px-4 py-3 backdrop-blur">
                <h3 className="text-lg font-semibold">{section}</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  {items.length} symbol{items.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-white/10 lg:block">
                <div className="grid grid-cols-[120px_1fr_140px] bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
                  <span>Character</span>
                  <span>Morse</span>
                  <span>Category</span>
                </div>
                {items.map((entry) => (
                  <div
                    key={entry.character}
                    className="grid grid-cols-[120px_1fr_140px] items-center border-t border-white/10 px-5 py-4"
                  >
                    <span className="text-2xl font-semibold">{entry.character}</span>
                    <span className="font-mono tracking-[0.28em] accent-text">{entry.morse}</span>
                    <span className="text-sm text-[rgb(var(--muted))]">{entry.category}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 lg:hidden sm:grid-cols-2">
                {items.map((entry) => (
                  <ReferenceCard key={entry.character} {...entry} />
                ))}
              </div>
            </section>
          );
        })}

        {query.trim() && filteredEntries.length === 0 ? (
          <div className="panel px-5 py-8 text-center md:px-6">
            <h3 className="text-lg font-semibold">No matches found</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">
              Try a character like `A`, a Morse pattern like `.-`, or a category
              like `Numbers`.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
