import React, { useRef } from "react";
import { Rnd } from "react-rnd";

function DraggableElement({
  element,
  index,
  isSelected,
  onSelect,
  onChange,
  containerWidth,
}) {
  const rndRef = useRef(null);

  if (!element) return null;

  const handleDragStop = (e, d) => {
    const updatedElement = {
      ...element,
      xposition: d.x,
      yposition: d.y,
    };

    console.log("Element:", updatedElement);

    onChange({
      xposition: d.x,
      yposition: d.y,
    });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newWidth = parseInt(ref.style.width, 10);
    const newHeight = parseInt(ref.style.height, 10);

    const updatedElement = {
      ...element,
      xposition: position.x,
      yposition: position.y,
      width: newWidth,
      height: newHeight,
    };

    console.log("Element:", updatedElement);

    onChange({
      xposition: position.x,
      yposition: position.y,
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <Rnd
      ref={rndRef}
      default={{
        x: element.xposition,
        y: element.yposition,
        width: element.width,
        height: element.height,
      }}
      position={{
        x: element.xposition,
        y: element.yposition,
      }}
      size={{
        width: element.width,
        height: element.height,
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={50}
      minHeight={20}
      maxWidth={containerWidth - element.xposition}
      bounds="parent"
      className={`cursor-move select-none ${
        isSelected
          ? "ring-2 ring-sky-500 shadow-lg"
          : "ring-1 ring-slate-300 hover:ring-slate-400"
      }`}
      style={{
        backgroundColor: `rgba(255, 255, 255, 0.7)`,
        border: isSelected ? "2px solid #0ea5e9" : "1px solid #cbd5e1",
      }}
      onClick={onSelect}
    >
      <div
        className="pointer-events-none flex items-center justify-center overflow-hidden text-center"
        style={{
          width: "100%",
          height: "100%",
          fontSize: element.fontSize,
          fontFamily: "Arial, sans-serif",
          color: "#000",
          textAlign: element.textAlign || "center",
          padding: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {element.previewText || element.elementName || "Element"}
      </div>
    </Rnd>
  );
}

export default DraggableElement;
