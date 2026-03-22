import React, { useEffect, useMemo, useRef } from "react";
import Draggable from "react-draggable";

const GRID_SIZE = 10;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function ElementsLayer({
  elements,
  canvasWidth,
  canvasHeight,
  selectedId,
  onSelectElement,
  onUpdateElement,
}) {
  const selectedRef = useRef(null);

  const normalizedElements = useMemo(() => {
    return elements.map((element) => {
      const fallbackPixelX = Math.round((element.x || 0) * canvasWidth);
      const fallbackPixelY = Math.round((element.y || 0) * canvasHeight);
      const pixelX = Number.isFinite(element.pixelX) ? element.pixelX : fallbackPixelX;
      const pixelY = Number.isFinite(element.pixelY) ? element.pixelY : fallbackPixelY;

      return {
        ...element,
        pixelX: clamp(pixelX, 0, canvasWidth),
        pixelY: clamp(pixelY, 0, canvasHeight),
      };
    });
  }, [elements, canvasWidth, canvasHeight]);

  useEffect(() => {
    const selected = normalizedElements.find((item) => item.id === selectedId);
    if (!selected || !selectedRef.current) return;

    const onKeyDown = (event) => {
      const isArrow = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);
      if (!isArrow) return;

      event.preventDefault();
      const step = event.shiftKey ? 5 : 1;
      let nextX = selected.pixelX;
      let nextY = selected.pixelY;

      if (event.key === "ArrowLeft") nextX -= step;
      if (event.key === "ArrowRight") nextX += step;
      if (event.key === "ArrowUp") nextY -= step;
      if (event.key === "ArrowDown") nextY += step;

      nextX = clamp(nextX, 0, canvasWidth);
      nextY = clamp(nextY, 0, canvasHeight);

      onUpdateElement(selected.id, {
        pixelX: nextX,
        pixelY: nextY,
        x: canvasWidth ? nextX / canvasWidth : 0,
        y: canvasHeight ? nextY / canvasHeight : 0,
      });
    };

    const current = selectedRef.current;
    current.addEventListener("keydown", onKeyDown);
    return () => current.removeEventListener("keydown", onKeyDown);
  }, [normalizedElements, selectedId, onUpdateElement, canvasWidth, canvasHeight]);

  return (
    <div className="relative z-10 h-full w-full">
      {normalizedElements.map((element) => {
        const isSelected = selectedId === element.id;

        return (
          <Draggable
            key={element.id}
            position={{ x: element.pixelX, y: element.pixelY }}
            bounds="parent"
            grid={[GRID_SIZE, GRID_SIZE]}
            onStart={() => onSelectElement(element.id)}
            onStop={(_, data) => {
              const snappedX = clamp(Math.round(data.x / GRID_SIZE) * GRID_SIZE, 0, canvasWidth);
              const snappedY = clamp(Math.round(data.y / GRID_SIZE) * GRID_SIZE, 0, canvasHeight);
              onUpdateElement(element.id, {
                pixelX: snappedX,
                pixelY: snappedY,
                x: canvasWidth ? snappedX / canvasWidth : 0,
                y: canvasHeight ? snappedY / canvasHeight : 0,
              });
            }}
            onDrag={(_, data) => {
              const nextX = clamp(data.x, 0, canvasWidth);
              const nextY = clamp(data.y, 0, canvasHeight);
              onUpdateElement(element.id, {
                pixelX: nextX,
                pixelY: nextY,
                x: canvasWidth ? nextX / canvasWidth : 0,
                y: canvasHeight ? nextY / canvasHeight : 0,
              });
            }}
          >
            <div
              ref={isSelected ? selectedRef : null}
              tabIndex={0}
              role="button"
              onClick={() => onSelectElement(element.id)}
              className={[
                "absolute min-w-[40px] cursor-move rounded px-1 py-0.5 outline-none",
                isSelected ? "ring-2 ring-blue-500" : "ring-1 ring-transparent",
              ].join(" ")}
              style={{ zIndex: Math.max(10, element.zIndex || 10) }}
            >
              {element.type === "signature" && element.value ? (
                <img src={element.value} alt="signature" className="max-h-16 object-contain" />
              ) : (
                <span
                  style={{
                    fontSize: element.fontSize || 24,
                    color: element.color || "#111827",
                    fontWeight: element.fontWeight || 500,
                  }}
                >
                  {element.value || "Text"}
                </span>
              )}
            </div>
          </Draggable>
        );
      })}
    </div>
  );
}
