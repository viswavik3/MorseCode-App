import { Copy, Eraser, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ControlButton from "../components/ControlButton";
import SectionHeading from "../components/SectionHeading";
import { isSupportedCharacter, normalizeInputText, textToMorse } from "../utils/morse";

export default function ReversePage() {
  const [text, setText] = useState("");
  const [highlightTokenIndex, setHighlightTokenIndex] = useState(-1);

  const normalizedText = useMemo(() => normalizeInputText(text), [text]);
  const morseOutput = useMemo(() => textToMorse(normalizedText), [normalizedText]);
  const morseTokens = useMemo(() => morseOutput.split(" "), [morseOutput]);

  useEffect(() => {
    if (!normalizedText) {
      setHighlightTokenIndex(-1);
      return;
    }

    const supportedCharacters = normalizedText
      .split("")
      .filter((character) => isSupportedCharacter(character));
    setHighlightTokenIndex(Math.max(supportedCharacters.length - 1, 0));

    const timeout = window.setTimeout(() => setHighlightTokenIndex(-1), 450);
    return () => window.clearTimeout(timeout);
  }, [normalizedText]);

  async function handleCopy() {
    await navigator.clipboard.writeText(morseOutput);
  }

  return (
    <section className="pb-8">
      <SectionHeading
        eyebrow="Reverse Mode"
        title="Convert live text into readable Morse instantly."
        description="Type naturally and watch the signal stream update in real time, with graceful handling for spaces and unsupported characters."
      />

      <div className="grid gap-6">
        <div className="panel px-5 py-5 md:px-6">
          <label htmlFor="reverse-input" className="text-sm font-medium text-[rgb(var(--muted))]">
            Source text
          </label>
          <textarea
            id="reverse-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type text, numbers, or punctuation to generate Morse..."
            className="mt-3 min-h-40 w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-base outline-none transition placeholder:text-[rgb(var(--muted))] focus:border-cyan-300/40 focus:bg-white/[0.08]"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <ControlButton variant="danger" onClick={() => setText("")}>
              <Eraser className="h-4 w-4" />
              Clear input
            </ControlButton>
            <ControlButton variant="primary" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copy Morse output
            </ControlButton>
          </div>
        </div>

        <div className="panel px-5 py-5 md:px-6">
          <div className="eyebrow flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Morse Output
          </div>
          <div className="panel-elevated mt-4 min-h-48 px-5 py-5">
            {morseOutput ? (
              <div className="flex flex-wrap gap-3">
                {morseTokens.map((token, index) => (
                  <span
                    key={`${token}-${index}`}
                    className={[
                      "rounded-2xl border px-4 py-3 font-mono tracking-[0.28em] transition duration-300",
                      token === "/"
                        ? "border-white/10 bg-white/[0.04] text-[rgb(var(--muted))]"
                        : "border-cyan-300/20 bg-cyan-400/10 text-[rgb(var(--text))]",
                      highlightTokenIndex === index &&
                        "border-amber-300/40 bg-amber-400/15 text-[rgb(var(--text))] shadow-lg shadow-amber-950/20",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {token}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[rgb(var(--muted))]">
                Morse output will appear here as you type.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
