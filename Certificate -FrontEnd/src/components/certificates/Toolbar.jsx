const FIELD_BUTTONS = [
  { elementName: "Student Name", elementType: "text" },
  { elementName: "Student Photo", elementType: "image" },
  { elementName: "Guardian Name", elementType: "text" },
  { elementName: "Course", elementType: "text" },
  { elementName: "Center Name", elementType: "text" },
  { elementName: "Duration", elementType: "text" },
  { elementName: "Grade", elementType: "text" },
  { elementName: "Training Start", elementType: "text" },
  { elementName: "Training End", elementType: "text" },
  { elementName: "Registration No", elementType: "text" },
  { elementName: "Issue Date", elementType: "text" },
  { elementName: "Certificate No", elementType: "text" },
  { elementName: "QR Code", elementType: "qr" },
];

function Toolbar({ onAddElement }) {
  return (
    <aside className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        Fields
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Click a field to add it to the canvas.
      </p>

      <div className="mt-4 grid max-h-[70vh] grid-cols-1 gap-2 overflow-auto pr-1">
        {FIELD_BUTTONS.map((field) => (
          <button
            key={field.elementName}
            type="button"
            onClick={() => onAddElement(field)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition-all duration-150 hover:-translate-y-[1px] hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {field.elementName}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Toolbar;
