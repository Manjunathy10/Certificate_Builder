import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Toolbar from "../../components/certificates/Toolbar";
import Canvas from "../../components/certificates/Canvas";
import {
  createTemplate,
  generateCertificatePdf,
  getCertificateStudents,
  getTemplateById,
  updateTemplate,
  uploadAsset,
} from "../../services/templateService";

const BACKEND_ORIGIN = "http://localhost:8083";
const DEBUG_FALLBACK_BACKGROUND = "";

const FONT_FAMILIES = ["Poppins", "Merriweather", "Lora", "Montserrat", "Roboto Slab", "Times New Roman"];

const INITIAL_TEMPLATE = {
  templateName: "",
  orientation: "portrait",
  backgroundImage: "",
  fontFamily: "Poppins",
  fontSize: 24,
  fontColor: "#111827",
  bold: false,
  italic: false,
};

const PLACEHOLDER_MAP = {
  "Student Name": "{{student_name}}",
  "Student Photo": "{{student_photo}}",
  "Guardian Name": "{{guardian_name}}",
  Course: "{{course}}",
  "Center Name": "{{center_name}}",
  Duration: "{{duration}}",
  Grade: "{{grade}}",
  "Training Start": "{{training_start}}",
  "Training End": "{{training_end}}",
  "Registration No": "{{registration_no}}",
  "Issue Date": "{{issue_date}}",
  "Certificate No": "{{certificate_no}}",
  "QR Code": "{{certificate_no}}",
};

function toSnakeCase(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function fromSnakeCase(value = "") {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function mapApiElement(element = {}, index = 0) {
  const rawName = element.elementName || element.name || "text";
  return {
    id: element.id || `el_${Date.now()}_${index}`,
    elementName: fromSnakeCase(rawName),
    elementType: element.elementType || element.type || "text",
    x: Number(element.x ?? element.xPosition ?? 10),
    y: Number(element.y ?? element.yPosition ?? 10),
    width: Number(element.width ?? 20),
    height: Number(element.height ?? 8),
    fontSize: Number(element.fontSize ?? 24),
    textAlign: element.textAlign || "center",
    value: element.value ?? element.staticValue ?? "",
    fontFamily: element.fontFamily,
    fontColor: element.fontColor,
    bold: Boolean(element.bold),
    italic: Boolean(element.italic),
    zIndex: Number(element.zIndex ?? index + 1),
  };
}

function toSavePayload(templateData, elements) {
  return {
    templateName: templateData.templateName,
    orientation: templateData.orientation,
    backgroundImage: templateData.backgroundImage,
    fontFamily: templateData.fontFamily,
    fontSize: Number(templateData.fontSize),
    fontColor: templateData.fontColor,
    bold: templateData.bold,
    italic: templateData.italic,
    elements: (Array.isArray(elements) ? elements : []).map((element) => ({
      elementName: toSnakeCase(element.elementName || "text"),
      elementType: element.elementType,
      xPosition: Number(element.x ?? 0),
      yPosition: Number(element.y ?? 0),
      width: Number(element.width ?? 20),
      height: Number(element.height ?? 8),
      fontSize: Number(element.fontSize ?? templateData.fontSize ?? 24),
      textAlign: element.textAlign || "center",
      staticValue: element.value || "",
    })),
  };
}

function CertificateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  const normalizeBackgroundUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    return rawUrl.startsWith("http") ? rawUrl : `${BACKEND_ORIGIN}${rawUrl}`;
  };

  const isSaveDisabled = useMemo(() => {
    return isSaving || !templateData.templateName.trim() || !Array.isArray(elements) || elements.length === 0;
  }, [isSaving, templateData.templateName, elements]);

  const maxZIndex = useMemo(() => {
    if (!elements.length) return 1;
    return Math.max(...elements.map((item) => item.zIndex || 1));
  }, [elements]);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getTemplateById(id);
        const loadedBackground = data.backgroundImage || data.backgroundUrl || "";
        setTemplateData((previous) => ({
          ...previous,
          templateName: data.templateName || data.name || "",
          orientation: data.orientation || "portrait",
          backgroundImage: normalizeBackgroundUrl(loadedBackground),
          fontFamily: data.fontFamily || "Poppins",
          fontSize: Number(data.fontSize) || 24,
          fontColor: data.fontColor || "#111827",
          bold: Boolean(data.bold),
          italic: Boolean(data.italic),
        }));
        setBackgroundUrl(normalizeBackgroundUrl(data.backgroundImage || data.backgroundUrl || ""));
        const loadedElements = Array.isArray(data?.elements)
          ? data.elements.map((item, index) => mapApiElement(item, index))
          : [];
        setElements(loadedElements);
        setSelectedElement(null);
        setHasUnsavedChanges(false);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load template";
        setErrorMessage(message);
        toast.error("Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "You have unsaved changes";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    console.log("UPDATED BACKGROUND:", backgroundUrl);
  }, [backgroundUrl]);

  useEffect(() => {
    console.log("Passing to Canvas:", backgroundUrl);
  }, [backgroundUrl]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getCertificateStudents();
        const list = Array.isArray(data) ? data : [];
        setStudents(list);
      } catch {
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

  const handleAddElement = ({ elementName, elementType }) => {
    const nextElement = {
      id: `el_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      elementName,
      elementType,
      x: 10,
      y: 10,
      width: elementType === "text" ? 28 : 20,
      height: elementType === "text" ? 8 : 18,
      fontSize: templateData.fontSize,
      textAlign: "center",
      value: PLACEHOLDER_MAP[elementName] || `{{${elementName.toLowerCase().replace(/\s+/g, "_")}}}`,
      fontFamily: templateData.fontFamily,
      fontColor: templateData.fontColor,
      bold: templateData.bold,
      italic: templateData.italic,
      zIndex: maxZIndex + 1,
    };

    setElements((previous) => [...previous, nextElement]);
    setSelectedElement(nextElement);
    setHasUnsavedChanges(true);
  };

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadResult = await uploadAsset(file);
      const imageUrl = typeof uploadResult === "string" ? uploadResult : uploadResult?.url || "";
      console.log("UPLOAD URL:", imageUrl);
      const fullUrl = normalizeBackgroundUrl(imageUrl);

      if (!fullUrl) {
        toast.error("Upload failed");
        return;
      }

      setBackgroundUrl(fullUrl);
      setTemplateData((previous) => ({ ...previous, backgroundImage: fullUrl }));

      if (DEBUG_FALLBACK_BACKGROUND) {
        // Fallback test:
        // setBackgroundUrl("http://localhost:8083/uploads/sample.png");
        setBackgroundUrl(DEBUG_FALLBACK_BACKGROUND);
        setTemplateData((previous) => ({ ...previous, backgroundImage: DEBUG_FALLBACK_BACKGROUND }));
      }

      setHasUnsavedChanges(true);
      toast.success("Background uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateData.templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const payload = toSavePayload(templateData, elements);
      if (id) {
        await updateTemplate(id, payload);
        setHasUnsavedChanges(false);
        toast.success("Template updated");
      } else {
        const created = await createTemplate(payload);
        const createdId = created?.id || created?._id || created?.templateId;
        setHasUnsavedChanges(false);
        toast.success("Template saved");
        if (createdId) {
          navigate(`/dashboard/certificates/builder/${createdId}`);
        }
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Save failed";
      setErrorMessage(message);
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    const templateId = id || "";
    if (!templateId) {
      toast.error("Save template first, then generate PDF");
      return;
    }
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }

    setIsGeneratingPdf(true);
    setErrorMessage("");
    try {
      const blob = await generateCertificatePdf(selectedStudentId, templateId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificate_${templateId}_${selectedStudentId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF generated");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to generate PDF";
      setErrorMessage(message);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const updateSelectedElement = (patch) => {
    if (!selectedElement) return;
    setElements((previous) => previous.map((item) => (item.id === selectedElement.id ? { ...item, ...patch } : item)));
    setSelectedElement((previous) => (previous ? { ...previous, ...patch } : previous));
    setHasUnsavedChanges(true);
  };

  const deleteSelected = () => {
    if (!selectedElement) return;
    setElements((previous) => previous.filter((item) => item.id !== selectedElement.id));
    setSelectedElement(null);
    setHasUnsavedChanges(true);
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;
    const duplicate = {
      ...selectedElement,
      id: `el_${Date.now()}_dup_${Math.random().toString(16).slice(2)}`,
      x: Math.min(95, Number(selectedElement.x) + 2),
      y: Math.min(95, Number(selectedElement.y) + 2),
      zIndex: maxZIndex + 1,
    };
    setElements((previous) => [...previous, duplicate]);
    setSelectedElement(duplicate);
    setHasUnsavedChanges(true);
  };

  const bringForward = () => {
    if (!selectedElement) return;
    updateSelectedElement({ zIndex: (selectedElement.zIndex || 1) + 1 });
  };

  const sendBackward = () => {
    if (!selectedElement) return;
    updateSelectedElement({ zIndex: Math.max(1, (selectedElement.zIndex || 1) - 1) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-slate-600">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <span>Loading template...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Toaster position="top-center" />

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Template name"
            value={templateData.templateName}
            onChange={(event) => {
              setTemplateData((previous) => ({ ...previous, templateName: event.target.value }));
              setHasUnsavedChanges(true);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />

          <select
            value={templateData.orientation}
            onChange={(event) => {
              setTemplateData((previous) => ({ ...previous, orientation: event.target.value }));
              setHasUnsavedChanges(true);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            <span>Upload Background</span>
            <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
            <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">Browse</span>
          </label>

          <select
            value={templateData.fontFamily}
            onChange={(event) => {
              setTemplateData((previous) => ({ ...previous, fontFamily: event.target.value }));
              setHasUnsavedChanges(true);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={8}
            max={100}
            value={templateData.fontSize}
            onChange={(event) => {
              setTemplateData((previous) => ({ ...previous, fontSize: Number(event.target.value) || 16 }));
              setHasUnsavedChanges(true);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />

          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            <span>Font color</span>
            <input
              type="color"
              value={templateData.fontColor}
              onChange={(event) => {
                setTemplateData((previous) => ({ ...previous, fontColor: event.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="h-8 w-10 rounded border-0 bg-transparent"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setTemplateData((previous) => ({ ...previous, bold: !previous.bold }));
              setHasUnsavedChanges(true);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              templateData.bold
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            }`}
          >
            Bold
          </button>

          <button
            type="button"
            onClick={() => {
              setTemplateData((previous) => ({ ...previous, italic: !previous.italic }));
              setHasUnsavedChanges(true);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              templateData.italic
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            }`}
          >
            Italic
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {hasUnsavedChanges ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">You have unsaved changes</span> : null}

          <button
            type="button"
            onClick={() => setIsPreviewMode((previous) => !previous)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {isPreviewMode ? "Hide Preview" : "Preview with Dummy Data"}
          </button>

          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={isSaveDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" /> : null}
            {isSaving ? "Saving..." : "Save Template"}
          </button>

          <select
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select student</option>
            {(Array.isArray(students) ? students : []).map((student) => {
              const studentId = String(student.id || student.studentId || student._id || "");
              const studentName = student.fullName || student.name || student.studentName || studentId;
              return (
                <option key={studentId} value={studentId}>
                  {studentName}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf || !id}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingPdf ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-white" /> : null}
            {isGeneratingPdf ? "Generating..." : "Generate PDF"}
          </button>

          {selectedElement && (
            <>
              <button type="button" onClick={duplicateSelected} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Duplicate</button>
              <button type="button" onClick={deleteSelected} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button>
              <button type="button" onClick={bringForward} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Bring Forward</button>
              <button type="button" onClick={sendBackward} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Send Backward</button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <Toolbar onAddElement={handleAddElement} />

        <div className="space-y-4">
          {selectedElement && (
            <div className="space-y-3 rounded-xl border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-700 dark:bg-slate-900">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Element Properties</div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input
                type="text"
                value={selectedElement.value || ""}
                onChange={(event) => updateSelectedElement({ value: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                placeholder="Element value"
              />
              <input
                type="number"
                min={8}
                max={100}
                value={selectedElement.fontSize || templateData.fontSize}
                onChange={(event) => updateSelectedElement({ fontSize: Number(event.target.value) || 16 })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <select
                value={selectedElement.textAlign || "center"}
                onChange={(event) => updateSelectedElement({ textAlign: event.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>

                <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <span>Font color</span>
                  <input
                    type="color"
                    value={selectedElement.fontColor || templateData.fontColor}
                    onChange={(event) => updateSelectedElement({ fontColor: event.target.value })}
                    className="ml-auto h-7 w-9 rounded border-0 bg-transparent"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateSelectedElement({ bold: !selectedElement.bold })}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      selectedElement.bold
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedElement({ italic: !selectedElement.italic })}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      selectedElement.italic
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    Italic
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  Delete Element
                </button>
              </div>
            </div>
          )}

          <Canvas
            orientation={templateData.orientation}
            backgroundUrl={backgroundUrl}
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onElementsChange={setElements}
            previewMode={isPreviewMode}
            templateStyle={{
              fontFamily: templateData.fontFamily,
              fontSize: templateData.fontSize,
              fontColor: templateData.fontColor,
              bold: templateData.bold,
              italic: templateData.italic,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CertificateBuilder;
