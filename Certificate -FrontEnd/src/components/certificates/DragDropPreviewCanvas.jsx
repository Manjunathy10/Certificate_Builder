import React from "react";
import DraggableElement from "./DraggableElement";

function DragDropPreviewCanvas({
  template,
  elements,
  imagePreview,
  selectedElementIndex,
  onElementSelect,
  onElementChange,
}) {
  const containerWidth = template.orientation === "PORTRAIT" ? 720 : 960;
  const containerHeight = template.orientation === "PORTRAIT" ? 960 : 600;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Drag & Drop Preview
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {template.orientation}
        </span>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div
          style={{
            position: "relative",
            width: containerWidth,
            height: containerHeight,
            backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#f8fafc",
            border: "2px solid #cbd5e1",
            borderRadius: "10px",
            margin: "0 auto",
          }}
        >
          {!imagePreview ? (
            <div className="absolute inset-0 grid place-items-center text-sm font-medium text-slate-500">
              Upload a background image to start editing.
            </div>
          ) : null}

          {elements.map((element, index) => (
            <DraggableElement
              key={`${element.elementName}_${index}`}
              element={element}
              index={index}
              isSelected={selectedElementIndex === index}
              onSelect={() => onElementSelect(index)}
              onChange={(patch) => onElementChange(index, patch)}
              containerHeight={containerHeight}
              containerWidth={containerWidth}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Canvas: {containerWidth} × {containerHeight}px | Drag to move | Resize from corners
      </div>
    </section>
  );
}

export default DragDropPreviewCanvas;
