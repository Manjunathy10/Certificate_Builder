import React from "react";

const PLACEHOLDER_TEXT = {
  student_name: "John Carter",
  course: "Full Stack Web Development",
  grade: "A+",
  certificate_no: "CERT-2026-0007",
  issue_date: "22 Mar 2026",
  center_name: "Skyline Institute",
  duration: "6 Months",
  custom_text: "Custom Field",
};

function resolvePreviewText(element = {}) {
  if (element.previewText && element.previewText.trim()) return element.previewText;
  return PLACEHOLDER_TEXT[element.elementName] || element.elementName || "Text";
}

function PreviewCanvas({ template, elements, imagePreview }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Live Preview</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {template.orientation}
        </span>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div
          className="relative mx-auto"
          style={{
            width: template.orientation === "PORTRAIT" ? 720 : 960,
            height: template.orientation === "PORTRAIT" ? 960 : 600,
            backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
          }}
        >
          {!imagePreview ? (
            <div className="absolute inset-0 grid place-items-center text-sm font-medium text-slate-500">
              Upload a background image to preview your template.
            </div>
          ) : null}

          {elements.map((element, index) => (
            <div
              key={`${element.elementName}_${index}`}
              style={{
                position: "absolute",
                left: element.xposition,
                top: element.yposition,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                textAlign: element.textAlign,
                fontFamily: template.fontFamily,
                color: template.fontColor,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  element.textAlign === "left"
                    ? "flex-start"
                    : element.textAlign === "right"
                    ? "flex-end"
                    : "center",
                border: "1px dashed rgba(15, 23, 42, 0.25)",
                background: "rgba(255,255,255,0.35)",
                padding: "4px",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {resolvePreviewText(element)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PreviewCanvas;
