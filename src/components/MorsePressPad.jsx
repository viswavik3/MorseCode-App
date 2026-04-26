import { useRef, useState } from "react";
import clsx from "clsx";

export default function MorsePressPad({
  onDot,
  onDash,
  longPressMs = 300,
  disabled = false,
}) {
  const [isPressed, setIsPressed] = useState(false);
  const dashTriggeredRef = useRef(false);
  const timerRef = useRef(null);

  function clearTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handlePressStart() {
    if (disabled) {
      return;
    }

    setIsPressed(true);
    dashTriggeredRef.current = false;
    timerRef.current = window.setTimeout(() => {
      dashTriggeredRef.current = true;
      onDash();
    }, longPressMs);
  }

  function handlePressEnd() {
    if (disabled) {
      return;
    }

    clearTimer();
    setIsPressed(false);

    if (!dashTriggeredRef.current) {
      onDot();
    }
  }

  return (
    <button
      type="button"
      aria-label="Signal input pad"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={() => {
        if (isPressed) {
          handlePressEnd();
        }
      }}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className={clsx(
        "group relative isolate flex min-h-[20rem] w-full items-center justify-center overflow-hidden rounded-[2.25rem] border border-rose-200/35 bg-[linear-gradient(180deg,rgba(251,113,133,0.3),rgba(190,24,93,0.16))] px-8 py-12 text-center shadow-[0_0_0_1px_rgba(251,113,133,0.18),0_24px_60px_rgba(40,8,18,0.5)] transition duration-200 md:min-h-[27rem] md:px-12",
        isPressed && "scale-[0.99] border-rose-100/50 bg-[linear-gradient(180deg,rgba(251,113,133,0.38),rgba(225,29,72,0.22))]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,205,211,0.24),transparent_34%)]" />
      <div
        className={clsx(
          "absolute h-32 w-32 rounded-full border border-rose-50/25 bg-rose-50/12 opacity-95 transition md:h-40 md:w-40",
          isPressed && "animate-pulse-ring",
        )}
      />
      <div className="absolute inset-0 rounded-[2.25rem] border border-rose-100/10" />
    </button>
  );
}
