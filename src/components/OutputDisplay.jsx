import { Copy, Delete, Eraser } from "lucide-react";
import ControlButton from "./ControlButton";

export default function OutputDisplay({
  title,
  subtitle,
  value,
  placeholder,
  textareaRef,
  onChange,
  onSelect,
  onBackspace,
  onClear,
  onCopy,
}) {
  return (
    <div className="panel flex h-full flex-col px-5 py-5 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">{subtitle}</p>
        </div>
      </div>

      <div className="panel-elevated mt-5 flex min-h-52 flex-1 items-start px-5 py-4">
        <textarea
          data-testid="decoded-output"
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onSelect={onSelect}
          onClick={onSelect}
          onKeyUp={onSelect}
          placeholder={placeholder}
          className="min-h-52 w-full resize-none bg-transparent text-lg leading-8 text-[rgb(var(--text))] outline-none placeholder:text-[rgb(var(--muted))]"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ControlButton onClick={onBackspace}>
          <Delete className="h-4 w-4" />
          Backspace
        </ControlButton>
        <ControlButton variant="danger" onClick={onClear}>
          <Eraser className="h-4 w-4" />
          Clear all
        </ControlButton>
        <ControlButton variant="primary" onClick={onCopy}>
          <Copy className="h-4 w-4" />
          Copy
        </ControlButton>
      </div>
    </div>
  );
}
