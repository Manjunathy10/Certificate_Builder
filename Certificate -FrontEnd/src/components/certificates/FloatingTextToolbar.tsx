import type { ReactNode } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Minus, Plus } from "lucide-react";

interface CertificateElement {
  id: string;
  elementType?: string;
  value?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  fontColor?: string;
  bold?: boolean;
  italic?: boolean;
  x?: number;
  y?: number;
}

interface FloatingTextToolbarProps {
  selectedElement: CertificateElement | null;
  onChange: (patch: Partial<CertificateElement>) => void;
  onDelete: () => void;
}

const FONT_FAMILIES = ["Poppins", "Merriweather", "Lora", "Montserrat", "Roboto Slab", "Times New Roman"];

function AlignButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
        active
          ? "border-violet-300 bg-violet-100 text-violet-700"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function FloatingTextToolbar({ selectedElement, onChange, onDelete }: FloatingTextToolbarProps) {
  if (!selectedElement) {
    return null;
  }

  const supportsTextValue = selectedElement.elementType !== "image" && selectedElement.elementType !== "qr";
  const fontSize = Math.max(8, Number(selectedElement.fontSize || 16));

  const handleFontStep = (delta: number) => {
    const next = Math.min(100, Math.max(8, fontSize + delta));
    onChange({ fontSize: next });
  };

  return (
    <div className="inline-flex min-w-max items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100/95 p-2 shadow-[0_3px_10px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-900/95">
        {supportsTextValue ? (
          <input
            type="text"
            value={selectedElement.value || ""}
            onChange={(event) => onChange({ value: event.target.value })}
            className="h-8 w-40 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            placeholder="Text"
          />
        ) : null}

        <select
          value={selectedElement.fontFamily || "Poppins"}
          onChange={(event) => onChange({ fontFamily: event.target.value })}
          className="h-8 min-w-32 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>

        <div className="flex h-8 items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => handleFontStep(-1)}
            className="grid h-8 w-8 place-items-center text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Decrease font size"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min={8}
            max={100}
            value={fontSize}
            onChange={(event) => onChange({ fontSize: Number(event.target.value) || 16 })}
            className="h-8 w-14 border-x border-slate-300 bg-transparent px-1 text-center text-sm outline-none dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => handleFontStep(1)}
            className="grid h-8 w-8 place-items-center text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="Increase font size"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <AlignButton active={Boolean(selectedElement.bold)} onClick={() => onChange({ bold: !selectedElement.bold })}>
          <Bold className="h-4 w-4" />
        </AlignButton>

        <AlignButton active={Boolean(selectedElement.italic)} onClick={() => onChange({ italic: !selectedElement.italic })}>
          <Italic className="h-4 w-4" />
        </AlignButton>

        <div className="flex items-center gap-1">
          <AlignButton
            active={(selectedElement.textAlign || "center") === "left"}
            onClick={() => onChange({ textAlign: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </AlignButton>
          <AlignButton
            active={(selectedElement.textAlign || "center") === "center"}
            onClick={() => onChange({ textAlign: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </AlignButton>
          <AlignButton
            active={(selectedElement.textAlign || "center") === "right"}
            onClick={() => onChange({ textAlign: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </AlignButton>
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <label className="flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <span className="font-semibold">A</span>
          <input
            type="color"
            value={selectedElement.fontColor || "#000000"}
            onChange={(event) => onChange({ fontColor: event.target.value })}
            className="h-5 w-5 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
            aria-label="Font color"
          />
        </label>

        <button
          type="button"
          onClick={onDelete}
          className="h-8 rounded-lg border border-red-300 bg-white px-3 text-xs font-medium text-red-700 transition hover:bg-red-50"
        >
          Delete
        </button>
    </div>
  );
}
