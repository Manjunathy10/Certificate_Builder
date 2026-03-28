import React from "react";

function CoordinateInfo({ element, containerHeight }) {
  if (!element) return null;

  const screenTop = containerHeight - element.yposition - element.height;

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs">
      <div className="mb-2 font-semibold text-slate-700">Coordinates</div>
      <div className="grid grid-cols-2 gap-2 text-slate-600">
        <div>
          <span className="font-medium">X (left):</span> {element.xposition}px
        </div>
        <div>
          <span className="font-medium">Y PDF:</span> {element.yposition}px
        </div>
        <div>
          <span className="font-medium">Screen Top:</span> {screenTop}px
        </div>
        <div>
          <span className="font-medium">Size:</span> {element.width}×{element.height}px
        </div>
      </div>
      <div className="mt-2 border-t border-slate-200 pt-2 text-slate-500">
        PDF coordinates use bottom-left origin. Screen shows top-left origin.
      </div>
    </div>
  );
}

export default CoordinateInfo;
