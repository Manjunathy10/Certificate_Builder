import React from "react";

const ELEMENT_OPTIONS = [
  { value: "student_name", label: "Student Name" },
  { value: "course", label: "Course" },
  { value: "grade", label: "Grade" },
  { value: "certificate_no", label: "Certificate No" },
  { value: "issue_date", label: "Issue Date" },
  { value: "center_name", label: "Center Name" },
  { value: "duration", label: "Duration" },
  { value: "custom_text", label: "Custom Text" },
];

function NumberInput({ label, value, onChange, min = 0, max = 1200, step = 1 }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}

function ElementForm({ element, index, onChange, onDelete }) {
  if (!element) return null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Element {index + 1}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
          <span>Element Name</span>
          <select
            value={element.elementName}
            onChange={(event) => onChange({ elementName: event.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {ELEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">
          <span>Text Align</span>
          <select
            value={element.textAlign}
            onChange={(event) => onChange({ textAlign: event.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label className="md:col-span-2 flex flex-col gap-1 text-xs font-medium text-slate-700">
          <span>Display Text</span>
          <input
            type="text"
            value={element.previewText || ""}
            onChange={(event) => onChange({ previewText: event.target.value })}
            placeholder="Optional preview text"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumberInput
          label="Width"
          value={element.width}
          min={50}
          max={1200}
          onChange={(value) => onChange({ width: value })}
        />
        <NumberInput
          label="Height"
          value={element.height}
          min={20}
          max={600}
          onChange={(value) => onChange({ height: value })}
        />
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          min={8}
          max={160}
          onChange={(value) => onChange({ fontSize: value })}
        />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700">
            <span>X Position</span>
            <span>{element.xposition}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={1200}
            value={element.xposition}
            onChange={(event) => onChange({ xposition: Number(event.target.value) || 0 })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-600"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Y Position</span>
            <span>{element.yposition}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={900}
            value={element.yposition}
            onChange={(event) => onChange({ yposition: Number(event.target.value) || 0 })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-sky-600"
          />
        </div>
      </div>
    </article>
  );
}

export default ElementForm;
