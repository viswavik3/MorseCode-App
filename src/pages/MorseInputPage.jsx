import {
  ArrowRight,
  Keyboard,
  Sparkles,
  Space,
  Volume2,
  VolumeX,
  Vibrate,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ControlButton from "../components/ControlButton";
import MetricPill from "../components/MetricPill";
import MorsePressPad from "../components/MorsePressPad";
import OutputDisplay from "../components/OutputDisplay";
import SectionHeading from "../components/SectionHeading";
import { createTonePlayer, vibrate } from "../utils/audio";
import { getTimingConfig, resolvePrefix } from "../utils/morse";

const tonePlayer = createTonePlayer();
const { letterBreakMs, wordBreakMs, longPressMs } = getTimingConfig();

export default function MorseInputPage() {
  const [currentBuffer, setCurrentBuffer] = useState("");
  const [decodedOutput, setDecodedOutput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [lastSignal, setLastSignal] = useState("Idle");
  const [statusText, setStatusText] = useState("Ready for a new sequence");
  const [longPressThreshold, setLongPressThreshold] = useState(longPressMs);
  const [letterBreakThreshold, setLetterBreakThreshold] = useState(letterBreakMs);

  const letterTimerRef = useRef(null);
  const wordTimerRef = useRef(null);
  const currentBufferRef = useRef("");
  const decodedOutputRef = useRef("");
  const outputTextareaRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const activityIdRef = useRef(0);

  const resolution = useMemo(() => resolvePrefix(currentBuffer), [currentBuffer]);
  const wordBreakThreshold = Math.max(wordBreakMs, letterBreakThreshold + 700);

  useEffect(() => {
    currentBufferRef.current = currentBuffer;
  }, [currentBuffer]);

  useEffect(() => {
    decodedOutputRef.current = decodedOutput;
  }, [decodedOutput]);

  useEffect(() => {
    selectionRef.current = {
      start: decodedOutput.length,
      end: decodedOutput.length,
    };
  }, []);

  useEffect(() => {
    if (currentBufferRef.current) {
      scheduleResolution(currentBufferRef.current);
      setStatusText("Updated letter timeout");
    }
  }, [letterBreakThreshold]);

  useEffect(() => clearTimers, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code !== "Space" || event.repeat) {
        return;
      }
      event.preventDefault();
      handleSignalStart(event.timeStamp);
    }

    function onKeyUp(event) {
      if (event.code !== "Space") {
        return;
      }
      event.preventDefault();
      handleSignalEnd(event.timeStamp);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const keyPressStartedAt = useRef(null);

  function clearTimers() {
    if (letterTimerRef.current) {
      window.clearTimeout(letterTimerRef.current);
      letterTimerRef.current = null;
    }
    if (wordTimerRef.current) {
      window.clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }

  function syncSelectionFromElement(element = outputTextareaRef.current) {
    if (!element) {
      selectionRef.current = {
        start: decodedOutputRef.current.length,
        end: decodedOutputRef.current.length,
      };
      return selectionRef.current;
    }

    if (document.activeElement !== element) {
      selectionRef.current = {
        start: decodedOutputRef.current.length,
        end: decodedOutputRef.current.length,
      };
      return selectionRef.current;
    }

    selectionRef.current = {
      start: element.selectionStart ?? 0,
      end: element.selectionEnd ?? 0,
    };
    return selectionRef.current;
  }

  function applySelection(start, end = start, options = {}) {
    const { focus = false } = options;
    selectionRef.current = { start, end };
    window.setTimeout(() => {
      if (outputTextareaRef.current) {
        if (focus) {
          outputTextareaRef.current.focus();
        }
        outputTextareaRef.current.setSelectionRange(start, end);
      }
    }, 0);
  }

  function insertIntoOutput(text, options = {}) {
    const { preserveFocus = false } = options;
    const hasTextarea = Boolean(outputTextareaRef.current);
    const currentSelection = hasTextarea
      ? syncSelectionFromElement()
      : {
          start: decodedOutputRef.current.length,
          end: decodedOutputRef.current.length,
        };

    setDecodedOutput((current) => {
      const nextOutput =
        current.slice(0, currentSelection.start) +
        text +
        current.slice(currentSelection.end);
      decodedOutputRef.current = nextOutput;
      applySelection(
        currentSelection.start + text.length,
        currentSelection.start + text.length,
        { focus: preserveFocus && document.activeElement === outputTextareaRef.current },
      );
      return nextOutput;
    });
  }

  function deleteFromOutput() {
    const currentSelection = syncSelectionFromElement();
    const hasSelection = currentSelection.start !== currentSelection.end;
    const canDeletePrevious = currentSelection.start > 0;

    if (!hasSelection && !canDeletePrevious) {
      setStatusText("No decoded character to remove");
      return;
    }

    setDecodedOutput((current) => {
      const deleteStart = hasSelection
        ? currentSelection.start
        : currentSelection.start - 1;
      const deleteEnd = currentSelection.end;
      const nextOutput =
        current.slice(0, deleteStart) + current.slice(deleteEnd);
      decodedOutputRef.current = nextOutput;
      applySelection(deleteStart, deleteStart, {
        focus: document.activeElement === outputTextareaRef.current,
      });
      return nextOutput;
    });
    setStatusText("Removed decoded character");
  }

  function scheduleResolution(nextBuffer) {
    clearTimers();
    const activityId = ++activityIdRef.current;

    letterTimerRef.current = window.setTimeout(() => {
      if (
        activityId === activityIdRef.current &&
        currentBufferRef.current === nextBuffer
      ) {
        finalizeLetter(nextBuffer);
      }
    }, letterBreakThreshold);

    wordTimerRef.current = window.setTimeout(() => {
      if (activityId !== activityIdRef.current) {
        return;
      }

      if (currentBufferRef.current === nextBuffer) {
        finalizeLetter(nextBuffer, true);
        return;
      }
    }, wordBreakThreshold);
  }

  function appendSymbol(symbol) {
    const nextBuffer = `${currentBufferRef.current}${symbol}`;
    currentBufferRef.current = nextBuffer;
    setCurrentBuffer(nextBuffer);
    setLastSignal(symbol === "." ? "Dot" : "Dash");
    setStatusText("Listening for letter completion");
    scheduleResolution(nextBuffer);
  }

  function finalizeLetter(bufferValue, appendWordBreak = false) {
    if (!bufferValue) {
      if (appendWordBreak) {
        setStatusText("Word break detected");
      }
      return;
    }

    const { exact } = resolvePrefix(bufferValue);
    if (exact) {
      insertIntoOutput(exact);
      setStatusText(appendWordBreak ? "Word break detected" : `Resolved to ${exact}`);
    } else {
      setStatusText("Sequence not recognized");
    }

    currentBufferRef.current = "";
    setCurrentBuffer("");
  }

  function emitSignal(symbol) {
    appendSymbol(symbol);
    if (soundEnabled) {
      tonePlayer(symbol === "." ? 80 : 180);
    }
    if (hapticsEnabled) {
      vibrate(symbol === "." ? 14 : 24);
    }
  }

  function handleSignalStart(timestamp) {
    keyPressStartedAt.current = timestamp;
  }

  function handleSignalEnd(timestamp) {
    if (keyPressStartedAt.current == null) {
      return;
    }

    const duration = timestamp - keyPressStartedAt.current;
    keyPressStartedAt.current = null;
    emitSignal(duration > longPressThreshold ? "-" : ".");
  }

  function handleBackspace() {
    clearTimers();

    if (currentBufferRef.current) {
      const nextBuffer = currentBufferRef.current.slice(0, -1);
      currentBufferRef.current = nextBuffer;
      setCurrentBuffer(nextBuffer);
      setStatusText("Removed last signal from current buffer");
      if (nextBuffer) {
        scheduleResolution(nextBuffer);
      }
      return;
    }

    deleteFromOutput();
  }

  function handleClear() {
    clearTimers();
    currentBufferRef.current = "";
    decodedOutputRef.current = "";
    setCurrentBuffer("");
    setDecodedOutput("");
    setStatusText("Cleared session");
    setLastSignal("Idle");
  }

  function handleOutputChange(event) {
    const nextValue = event.target.value;
    decodedOutputRef.current = nextValue;
    setDecodedOutput(nextValue);
    syncSelectionFromElement(event.target);
  }

  function handleOutputSelection(event) {
    syncSelectionFromElement(event.target);
  }

  function handleInsertSpace() {
    clearTimers();
    if (currentBufferRef.current) {
      const { exact } = resolvePrefix(currentBufferRef.current);
      currentBufferRef.current = "";
      setCurrentBuffer("");
      insertIntoOutput(exact ? `${exact} ` : " ");
      setStatusText("Inserted space");
      return;
    }
    insertIntoOutput(" ");
    setStatusText("Inserted space");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(decodedOutput.trim());
      setStatusText("Copied decoded output");
    } catch {
      setStatusText("Clipboard copy unavailable");
    }
  }

  return (
    <section className="pb-8">
      <SectionHeading
        eyebrow="Input Mode"
        title="Shape live Morse signals into readable text."
        description="A responsive split-screen workspace with real-time prefix matching, tactile signal input, and automatic letter and word resolution."
        aside={
          <div className="flex flex-wrap gap-3">
            <ControlButton onClick={() => setSoundEnabled((value) => !value)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Sound {soundEnabled ? "On" : "Off"}
            </ControlButton>
            <ControlButton onClick={() => setHapticsEnabled((value) => !value)}>
              <Vibrate className="h-4 w-4" />
              Haptics {hapticsEnabled ? "On" : "Off"}
            </ControlButton>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="panel flex flex-col px-5 py-5 md:px-6">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricPill label="Current Buffer" value={currentBuffer || "--"} />
            <MetricPill
              label="Matches"
              value={resolution.matches.length}
              tone={resolution.matches.length ? "success" : "warning"}
            />
            <MetricPill label="Last Signal" value={lastSignal} />
          </div>

          <div className="panel-elevated mt-5 px-5 py-4">
            <div className="eyebrow flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Live Input
            </div>
            <p
              data-testid="live-input-buffer"
              className="mt-4 min-h-12 break-all font-mono text-3xl tracking-[0.35em] text-[rgb(var(--text))]"
            >
              {currentBuffer || ""}
            </p>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">{statusText}</p>
          </div>

          <div className="panel-elevated mt-6 px-4 py-4 md:px-5 md:py-5">
            <MorsePressPad
              longPressMs={longPressThreshold}
              onDot={() => emitSignal(".")}
              onDash={() => emitSignal("-")}
            />
            <div className="mt-4 flex justify-center">
              <ControlButton variant="danger" onClick={handleInsertSpace}>
                <Space className="h-4 w-4" />
                Add space
              </ControlButton>
            </div>
            <div className="mt-5 px-3 text-center">
              <h3 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text))] md:text-4xl">
                Tap. Hold. Translate.
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[rgb(var(--muted))] md:text-[1.15rem]">
                Short press for a dot, long press for a dash. You can also use
                the spacebar for fast keyboard input.
              </p>
            </div>
          </div>

          <div className="panel-elevated mt-4 px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Press break timeout</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  Set how long a press must be before it becomes a dash.
                </p>
              </div>
              <div className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-[rgb(var(--text))]">
                {longPressThreshold} ms
              </div>
            </div>
            <input
              aria-label="Press break timeout"
              type="range"
              min="150"
              max="700"
              step="10"
              value={longPressThreshold}
              onChange={(event) => setLongPressThreshold(Number(event.target.value))}
              className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-rose-400"
            />
            <div className="mt-2 flex justify-between text-xs text-[rgb(var(--muted))]">
              <span>Faster dashes</span>
              <span>Slower dashes</span>
            </div>
          </div>

          <div className="panel-elevated mt-4 px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Next letter timeout</h3>
                <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                  Control how long you can pause before the current Morse
                  sequence is committed as a letter.
                </p>
              </div>
              <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-[rgb(var(--text))]">
                {letterBreakThreshold} ms
              </div>
            </div>
            <input
              aria-label="Next letter timeout"
              type="range"
              min="400"
              max="1800"
              step="50"
              value={letterBreakThreshold}
              onChange={(event) =>
                setLetterBreakThreshold(Number(event.target.value))
              }
              className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400"
            />
            <div className="mt-2 flex justify-between text-xs text-[rgb(var(--muted))]">
              <span>Quicker letter break</span>
              <span>Longer pause allowed</span>
            </div>
            <p className="mt-3 text-xs text-[rgb(var(--muted))]">
              Word breaks remain longer and currently resolve at about {wordBreakThreshold} ms.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-stretch">
            <div className="panel-elevated flex flex-col justify-between px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold">Reference guide</h3>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
                  Browse the full A-Z, 0-9, and punctuation set on the dedicated
                  reference page.
                </p>
              </div>
              <Link
                to="/reference"
                className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-[rgb(var(--text))] transition hover:bg-cyan-400/15"
              >
                Open reference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="hidden items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-[rgb(var(--muted))] md:flex">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Spacebar enabled
              </div>
            </div>
          </div>
        </div>

        <OutputDisplay
          title="Decoded Output"
          subtitle="This is now an editable text field. Place the cursor anywhere to insert or delete specific characters."
          value={decodedOutput}
          placeholder="Decoded text will appear here as you signal."
          textareaRef={outputTextareaRef}
          onChange={handleOutputChange}
          onSelect={handleOutputSelection}
          onBackspace={handleBackspace}
          onClear={handleClear}
          onCopy={handleCopy}
        />
      </div>
    </section>
  );
}
