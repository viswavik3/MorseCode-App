import clsx from "clsx";

export default function ControlButton({
  children,
  className,
  variant = "default",
  ...props
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200",
        variant === "default" &&
          "border-white/10 bg-white/5 text-[rgb(var(--text))] hover:border-white/20 hover:bg-white/10",
        variant === "primary" &&
          "border-cyan-300/40 bg-cyan-400/15 text-cyan-50 hover:bg-cyan-400/20",
        variant === "danger" &&
          "border-rose-400/30 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
