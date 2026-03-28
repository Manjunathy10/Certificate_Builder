import { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/config/apiClient";
import ElementForm from "../../components/certificates/ElementForm";
import DragDropPreviewCanvas from "../../components/certificates/DragDropPreviewCanvas";
import CoordinateInfo from "../../components/certificates/CoordinateInfo";

const DEFAULT_ELEMENT = {
  elementName: "student_name",
  xposition: 0,
  yposition: 0,
  width: 200,
  height: 50,
  fontSize: 18,
  textAlign: "center",
  fontFamily: "Poppins",
  fontStyle: "normal",
  fontColor: "#000000",
  previewText: "",
};

const INITIAL_TEMPLATE = {
  templateName: "",
  orientation: "LANDSCAPE",
  fontFamily: "Arial",
  fontSize: 18,
  fontColor: "#000000",
  elements: [],
};

function downloadBlob(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function TemplateBuilderPage() {
  const [template, setTemplate] = useState(INITIAL_TEMPLATE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState(null);

  const canSubmit = useMemo(() => {
    return Boolean(template.templateName.trim() && selectedFile);
  }, [template.templateName, selectedFile]);

  const handleTemplateFieldChange = (patch) => {
    setTemplate((current) => ({ ...current, ...patch }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
  };

  const handleAddElement = () => {
    setTemplate((current) => ({
      ...current,
      elements: [...current.elements, { ...DEFAULT_ELEMENT }],
    }));
  };

  const handleElementChange = (index, patch) => {
    setTemplate((current) => ({
      ...current,
      elements: current.elements.map((element, elementIndex) =>
        elementIndex === index ? { ...element, ...patch } : element
      ),
    }));
  };

  const handleDeleteElement = (index) => {
    setTemplate((current) => ({
      ...current,
      elements: current.elements.filter((_, elementIndex) => elementIndex !== index),
    }));
    if (selectedElementIndex === index) {
      setSelectedElementIndex(null);
    }
  };

  const handleElementSelect = (index) => {
    setSelectedElementIndex(index);
  };

  const handleSubmitTemplate = async () => {
    if (!canSubmit) {
      toast.error("Template name and background image are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...template,
        elements: template.elements.map((element) => ({
          elementName: element.elementName,
          xposition: Number(element.xposition),
          yposition: Number(element.yposition),
          width: Number(element.width),
          height: Number(element.height),
          fontSize: Number(element.fontSize),
          textAlign: element.textAlign,
          fontFamily: element.fontFamily ?? "Poppins",
          fontStyle: element.fontStyle ?? "normal",
          fontColor: element.fontColor ?? "#000000",
        })),
      };

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("data", JSON.stringify(payload));

      await apiClient.post("/templates", formData);
      toast.success("Template submitted successfully.");
    } catch (error) {
      const message = error?.response?.data?.message || "Template submission failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.get("/certificates/generate", {
        responseType: "blob",
      });
      const filename = `${template.templateName || "certificate"}.pdf`;
      downloadBlob(response.data, filename);
      toast.success("Certificate generated.");
    } catch (error) {
      const message = error?.response?.data?.message || "Could not generate certificate.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <Toaster position="top-center" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">Certificate Template Builder</h1>
        <p className="mt-1 text-sm text-slate-500">
          Build a printable certificate layout, preview in real time, then submit it to backend.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <span>Template Name</span>
            <input
              type="text"
              value={template.templateName}
              onChange={(event) => handleTemplateFieldChange({ templateName: event.target.value })}
              placeholder="e.g. Completion Certificate"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <span>Orientation</span>
            <select
              value={template.orientation}
              onChange={(event) => handleTemplateFieldChange({ orientation: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="LANDSCAPE">LANDSCAPE</option>
              <option value="PORTRAIT">PORTRAIT</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <span>Font Family</span>
            <input
              type="text"
              value={template.fontFamily}
              onChange={(event) => handleTemplateFieldChange({ fontFamily: event.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <span>Default Font Size</span>
            <input
              type="number"
              min={8}
              max={96}
              value={template.fontSize}
              onChange={(event) => handleTemplateFieldChange({ fontSize: Number(event.target.value) || 18 })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span>Font Color</span>
            <input
              type="color"
              value={template.fontColor}
              onChange={(event) => handleTemplateFieldChange({ fontColor: event.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white p-1"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Background Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
            />
          </label>
        </div>

        {imagePreview ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Image Preview</p>
            <img
              src={imagePreview}
              alt="Selected certificate background"
              className="max-h-52 w-full rounded-xl border border-slate-200 object-cover"
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Template Elements</h2>
          <button
            type="button"
            onClick={handleAddElement}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Add Element
          </button>
        </div>

        {template.elements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No elements added yet. Click Add Element to start placing fields.
          </div>
        ) : (
          <div className="grid gap-3">
            {template.elements.map((element, index) => (
              <ElementForm
                key={`${element.elementName}_${index}`}
                element={element}
                index={index}
                onChange={(patch) => handleElementChange(index, patch)}
                onDelete={() => handleDeleteElement(index)}
              />
            ))}
          </div>
        )}
      </section>

      <DragDropPreviewCanvas
        template={template}
        elements={template.elements}
        imagePreview={imagePreview}
        selectedElementIndex={selectedElementIndex}
        onElementSelect={handleElementSelect}
        onElementChange={handleElementChange}
      />

      {selectedElementIndex !== null && template.elements[selectedElementIndex] ? (
        <CoordinateInfo
          element={template.elements[selectedElementIndex]}
          containerHeight={template.orientation === "PORTRAIT" ? 960 : 600}
        />
      ) : null}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-end">
        <button
          type="button"
          onClick={handleGenerateCertificate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? <Spinner className="size-4" /> : null}
          {isGenerating ? "Generating..." : "Generate Certificate"}
        </button>

        <button
          type="button"
          onClick={handleSubmitTemplate}
          disabled={!canSubmit || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Spinner className="size-4" /> : null}
          {isSubmitting ? "Submitting..." : "Submit Template"}
        </button>
      </section>
    </div>
  );
}

export default TemplateBuilderPage;
