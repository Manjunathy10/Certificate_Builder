import { useMemo } from "react";
import { Rnd } from "react-rnd";

const CANVAS_SIZES = {
  portrait: { width: 600, height: 800 },
  landscape: { width: 800, height: 600 },
};

const PREVIEW_VALUES = {
  student_name: "John Doe",
  course: "Full Stack Development",
};

function toPixels(percent, size) {
  return (Number(percent || 0) / 100) * size;
}

function toPercent(pixel, size) {
  if (!size) return 0;
  return Math.min(100, Math.max(0, (pixel / size) * 100));
}

function getPreviewText(value, previewMode) {
  if (!previewMode || typeof value !== "string") return value;
  return value.replace(/{{\s*([a-z0-9_]+)\s*}}/gi, (_, token) => PREVIEW_VALUES[token] || `{{${token}}}`);
}

function Canvas({
  orientation,
  backgroundUrl,
  elements,
  selectedElement,
  onSelectElement,
  onElementsChange,
  previewMode,
  templateStyle,
}) {
  console.log("Canvas received background:", backgroundUrl);
  const size = useMemo(() => CANVAS_SIZES[orientation] || CANVAS_SIZES.portrait, [orientation]);
  const safeElements = Array.isArray(elements) ? elements : [];
  const sortedElements = [...safeElements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  const updateElement = (id, patch) => {
    onElementsChange((previous) =>
      (Array.isArray(previous) ? previous : []).map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div
        className="relative mx-auto rounded-md bg-white shadow-2xl"
        style={{
          position: "relative",
          width: size.width,
          height: size.height,
        }}
      >
        {backgroundUrl && (
          <img
            src={backgroundUrl}
            alt="certificate background"
            onLoad={() => console.log("Image loaded")}
            onError={() => console.error("Image failed:", backgroundUrl)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              zIndex: 0,
            }}
          />
        )}

        {!backgroundUrl && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rounded bg-white/80 px-2 py-1 text-xs text-slate-500">Upload background</span>
          </div>
        )}

        {sortedElements.map((element) => {
          const left = toPixels(element.x, size.width);
          const top = toPixels(element.y, size.height);
          const width = toPixels(element.width || 20, size.width);
          const height = toPixels(element.height || 8, size.height);
          const isSelected = selectedElement?.id === element.id;

          return (
            <Rnd
              key={element.id}
              bounds="parent"
              position={{ x: left, y: top }}
              size={{ width: Math.max(50, width), height: Math.max(30, height) }}
              onDragStart={() => onSelectElement(element)}
              onResizeStart={() => onSelectElement(element)}
              onClick={(event) => {
                event.stopPropagation();
                onSelectElement(element);
              }}
              onDragStop={(_, data) => {
                updateElement(element.id, {
                  x: toPercent(data.x, size.width),
                  y: toPercent(data.y, size.height),
                });
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                updateElement(element.id, {
                  width: toPercent(ref.offsetWidth, size.width),
                  height: toPercent(ref.offsetHeight, size.height),
                  x: toPercent(position.x, size.width),
                  y: toPercent(position.y, size.height),
                });
              }}
              style={{ zIndex: Math.max(1, element.zIndex || 1) }}
              className={[
                "rounded border bg-white/70 backdrop-blur-sm transition-all duration-150",
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-300 shadow-[0_0_0_2px_rgba(59,130,246,0.18)]"
                  : "border-transparent hover:border-slate-300 hover:shadow-sm",
              ].join(" ")}
            >
              <div
                className="flex h-full w-full items-center justify-center px-2"
                style={{
                  fontFamily: element.fontFamily || templateStyle.fontFamily,
                  fontSize: `${element.fontSize || templateStyle.fontSize}px`,
                  color: element.fontColor || templateStyle.fontColor,
                  fontWeight: element.bold ? 700 : templateStyle.bold ? 700 : 400,
                  fontStyle: element.italic ? "italic" : templateStyle.italic ? "italic" : "normal",
                  textAlign: element.textAlign || "center",
                }}
              >
                {element.elementType === "text" && (
                  <span className="w-full break-words leading-tight">{getPreviewText(element.value, previewMode)}</span>
                )}
                {element.elementType === "image" && (
                  <div className="grid h-full w-full place-items-center rounded border border-dashed border-slate-400 text-xs text-slate-500">
                    {element.elementName}
                  </div>
                )}
                {element.elementType === "qr" && (
                  <div className="relative h-full w-full overflow-hidden rounded border border-slate-500 bg-white">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                        opacity: 0.35,
                      }}
                    />
                  </div>
                )}
              </div>
            </Rnd>
          );
        })}

        <button type="button" aria-label="clear selection" onClick={() => onSelectElement(null)} className="absolute inset-0 -z-10" />
      </div>
    </div>
  );
}

export default Canvas;
