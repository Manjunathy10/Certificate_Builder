import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import TopToolbar from "../../components/certificates/TopToolbar.tsx";
import LeftSidebar from "../../components/certificates/LeftSidebar.tsx";
import CanvasArea from "../../components/certificates/CanvasArea.tsx";
import RightPropertiesPanel from "../../components/certificates/RightPropertiesPanel.tsx";
import { detectUploadFileType, handleFileUpload } from "../../lib/canvasFileUpload";
import {
  createTemplate,
  generateCertificatePdf,
  getCertificateStudents,
  getTemplateById,
  patchTemplateElements,
} from "../../services/templateService";

const BACKEND_ORIGIN = "http://localhost:8083";
const DEBUG_FALLBACK_BACKGROUND = "";

const CANVAS_SIZES = {
  portrait: { width: 600, height: 800 },
  landscape: { width: 800, height: 600 },
};

// Global Y calibration for text baseline conversion across editor and generated output.
// Increase slightly if generated text appears higher than editor; decrease if lower.
const TEXT_BASELINE_ASCENT_RATIO = 0.74;
const TEXT_BASELINE_MIN_OFFSET_PX = 3;

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

function createElementId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `el_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizePercent(value, size, fallback = 10) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (!size) return Math.max(0, Math.min(100, numeric));
  if (numeric > 100) {
    return Math.max(0, Math.min(100, (numeric / size) * 100));
  }
  return Math.max(0, Math.min(100, numeric));
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function isTextLikeElementType(elementType = "") {
  return elementType === "text" || elementType === "static" || elementType === "dynamic";
}

function getCanvasSizeForOrientation(orientation = "portrait") {
  const key = String(orientation || "portrait").toLowerCase();
  return CANVAS_SIZES[key] || CANVAS_SIZES.portrait;
}

function getTextBaselineOffsetPercent(element = {}, canvasHeight = CANVAS_SIZES.portrait.height) {
  const safeCanvasHeight = Number(canvasHeight) > 0 ? Number(canvasHeight) : CANVAS_SIZES.portrait.height;
  const fontSizePx = Math.max(8, Number(element.fontSize ?? 24));
  const baselineOffsetPx = Math.max(TEXT_BASELINE_MIN_OFFSET_PX, fontSizePx * TEXT_BASELINE_ASCENT_RATIO);
  return (baselineOffsetPx / safeCanvasHeight) * 100;
}

function toApiYPosition(element = {}, canvasHeight = CANVAS_SIZES.portrait.height) {
  const y = clampPercent(element.y);
  if (!isTextLikeElementType(element.elementType)) {
    return y;
  }
  const baselineOffsetPercent = getTextBaselineOffsetPercent(element, canvasHeight);
  return clampPercent(y + baselineOffsetPercent);
}

function toEditorYPosition(element = {}, canvasSize = CANVAS_SIZES.portrait) {
  const rawY = normalizePercent(element.y ?? element.yposition ?? element.yPosition, canvasSize.height, 10);
  if (!isTextLikeElementType(element.elementType || element.type || "text")) {
    return rawY;
  }
  const baselineOffsetPercent = getTextBaselineOffsetPercent(element, canvasSize.height);
  return clampPercent(rawY - baselineOffsetPercent);
}

function mapApiElement(element = {}, index = 0, canvasSize = CANVAS_SIZES.portrait) {
  const rawName = element.elementName || element.name || "text";
  return {
    id: element.id || createElementId(),
    elementName: fromSnakeCase(rawName),
    elementType: element.elementType || element.type || "text",
    x: normalizePercent(element.x ?? element.xposition ?? element.xPosition, canvasSize.width, 10),
    y: toEditorYPosition(element, canvasSize),
    width: Number(element.width ?? 20),
    height: Number(element.height ?? 8),
    fontSize: Number(element.fontSize ?? 24),
    textAlign: element.textAlign || "center",
    value: element.value ?? element.staticValue ?? "",
    staticValue: element.staticValue ?? element.value ?? "",
    fontFamily: element.fontFamily,
    fontColor: element.fontColor,
    bold: Boolean(element.bold),
    italic: Boolean(element.italic),
    zIndex: Number(element.zIndex ?? index + 1),
  };
}

function toSavePayload(templateData, elements) {
  const canvasSize = getCanvasSizeForOrientation(templateData.orientation);
  return {
    templateName: templateData.templateName,
    orientation: String(templateData.orientation || "LANDSCAPE").toUpperCase(),
    fontFamily: templateData.fontFamily,
    fontSize: Number(templateData.fontSize),
    fontColor: templateData.fontColor,
    elements: (Array.isArray(elements) ? elements : []).map((element) => ({
      elementName: toSnakeCase(element.elementName || "text"),
      xposition: Number(element.x ?? 0),
      yposition: toApiYPosition(element, canvasSize.height),
      width: Number(element.width ?? 20),
      height: Number(element.height ?? 8),
      fontSize: Number(element.fontSize ?? templateData.fontSize ?? 24),
      textAlign: element.textAlign || "center",
      fontFamily: element.fontFamily ?? "Poppins",
      fontStyle: element.fontStyle ?? "normal",
      fontColor: element.fontColor ?? "#000000",
    })),
  };
}

function CertificateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE);
  const [elements, setElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const positionPatchTimeoutRef = useRef(null);
  const pendingPositionIdsRef = useRef(new Set());
  const latestElementsRef = useRef([]);
  const uploadRenderCanvasRef = useRef(null);
  const uploadedPreviewUrlRef = useRef("");

  const normalizeBackgroundUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    return rawUrl.startsWith("http") ? rawUrl : `${BACKEND_ORIGIN}${rawUrl}`;
  };

  const revokeUploadedPreviewUrl = useCallback(() => {
    if (!uploadedPreviewUrlRef.current) return;
    URL.revokeObjectURL(uploadedPreviewUrlRef.current);
    uploadedPreviewUrlRef.current = "";
  }, []);

  const isSaveDisabled = useMemo(() => {
    const missingRequiredData = !templateData.templateName.trim() || !Array.isArray(elements) || elements.length === 0;
    if (id) return isSaving || missingRequiredData;
    return isSaving || missingRequiredData || !selectedFile;
  }, [isSaving, templateData.templateName, elements, selectedFile, id]);

  const selectedElement = useMemo(
    () => (Array.isArray(elements) ? elements.find((item) => item.id === selectedElementId) || null : null),
    [elements, selectedElementId]
  );

  const maxZIndex = useMemo(() => {
    if (!elements.length) return 1;
    return Math.max(...elements.map((item) => item.zIndex || 1));
  }, [elements]);

  const flushPositionPatch = useCallback(
    async ({ showSuccess = false } = {}) => {
      if (!id) return 0;

      const pendingIds = Array.from(pendingPositionIdsRef.current);
      if (!pendingIds.length) return 0;

      const changed = pendingIds
        .map((elementId) => latestElementsRef.current.find((item) => item.id === elementId))
        .filter(Boolean)
        .map((item) => {
          const canvasSize = getCanvasSizeForOrientation(templateData.orientation);
          return {
            id: item.id,
            xPosition: Number(item.x ?? 0),
            yPosition: toApiYPosition(item, canvasSize.height),
          };
        });

      if (!changed.length) return 0;

      pendingPositionIdsRef.current.clear();
      await patchTemplateElements(id, changed);
      setHasUnsavedChanges(false);
      if (showSuccess) {
        toast.success("Template updated");
      }
      return changed.length;
    },
    [id, templateData.orientation]
  );

  const queuePositionPatch = useCallback(
    (elementId) => {
      if (!id || !elementId) return;
      pendingPositionIdsRef.current.add(elementId);

      if (positionPatchTimeoutRef.current) {
        window.clearTimeout(positionPatchTimeoutRef.current);
      }

      positionPatchTimeoutRef.current = window.setTimeout(async () => {
        try {
          await flushPositionPatch();
        } catch {
          // Keep UI responsive; failures are surfaced on explicit save.
        }
      }, 450);
    },
    [id, flushPositionPatch]
  );

  useEffect(() => {
    latestElementsRef.current = Array.isArray(elements) ? elements : [];
  }, [elements]);

  useEffect(() => {
    return () => {
      if (positionPatchTimeoutRef.current) {
        window.clearTimeout(positionPatchTimeoutRef.current);
      }
      revokeUploadedPreviewUrl();
    };
  }, [revokeUploadedPreviewUrl]);

  useEffect(() => {
    if (!id) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getTemplateById(id);
        const loadedBackground = data.backgroundImage || data.backgroundUrl || "";
        const loadedOrientation = String(data.orientation || "portrait").toLowerCase();
        const canvasSize = CANVAS_SIZES[loadedOrientation] || CANVAS_SIZES.portrait;
        setTemplateData((previous) => ({
          ...previous,
          templateName: data.templateName || data.name || "",
          orientation: loadedOrientation,
          backgroundImage: normalizeBackgroundUrl(loadedBackground),
          fontFamily: data.fontFamily || "Poppins",
          fontSize: Number(data.fontSize) || 24,
          fontColor: data.fontColor || "#111827",
          bold: Boolean(data.bold),
          italic: Boolean(data.italic),
        }));
        revokeUploadedPreviewUrl();
        setBackgroundUrl(normalizeBackgroundUrl(data.backgroundImage || data.backgroundUrl || ""));
        const loadedElements = Array.isArray(data?.elements)
          ? data.elements.map((item, index) => mapApiElement(item, index, canvasSize))
          : [];
        setElements(loadedElements);
        setSelectedElementId(null);
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
  }, [id, revokeUploadedPreviewUrl]);

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
      id: createElementId(),
      elementName,
      elementType,
      x: 10,
      y: 10,
      width: elementType === "text" ? 28 : 20,
      height: elementType === "text" ? 6 : 18,
      fontSize: templateData.fontSize,
      textAlign: "center",
      value: PLACEHOLDER_MAP[elementName] || `{{${elementName.toLowerCase().replace(/\s+/g, "_")}}}`,
      staticValue: "",
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontColor: "#000000",
      bold: templateData.bold,
      italic: templateData.italic,
      zIndex: maxZIndex + 1,
    };

    setElements((previous) => [...previous, nextElement]);
    setSelectedElementId(nextElement.id);
    setHasUnsavedChanges(true);
  };

  const applyBackgroundFromFile = useCallback(
    async (file) => {
      if (!file) return;
      if (!uploadRenderCanvasRef.current) {
        throw new Error("Background renderer is not ready. Please try again.");
      }

      const detectedType = detectUploadFileType(file);
      if (!detectedType) {
        throw new Error("Unsupported file type. Upload JPG, JPEG, PNG, or PDF.");
      }

      const result = await handleFileUpload(file, uploadRenderCanvasRef.current, {
        pageNumber: 1,
        maxDimension: 2000,
        imageMaxDimension: 1800,
      });

      revokeUploadedPreviewUrl();
      uploadedPreviewUrlRef.current = result.backgroundUrl;
      setBackgroundUrl(result.backgroundUrl);
      setTemplateData((previous) => ({ ...previous, backgroundImage: "" }));
      setHasUnsavedChanges(true);

      if (result.type === "pdf") {
        toast.success(`PDF first page loaded (${result.width}x${result.height})`);
      }
    },
    [revokeUploadedPreviewUrl]
  );

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSelectedFile(file);
      await applyBackgroundFromFile(file);
      if (DEBUG_FALLBACK_BACKGROUND) {
        setBackgroundUrl(DEBUG_FALLBACK_BACKGROUND);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Background rendering failed.";
      toast.error(message);
      setSelectedFile(null);
    }

    event.target.value = "";
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
        if (positionPatchTimeoutRef.current) {
          window.clearTimeout(positionPatchTimeoutRef.current);
        }
        const patchedCount = await flushPositionPatch({ showSuccess: true });
        if (!patchedCount) {
          toast.success("No position changes to sync");
        }
      } else {
        if (!selectedFile) {
          toast.error("Background image is required");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("data", JSON.stringify(payload));

        const created = await createTemplate(formData);
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
    if (Object.prototype.hasOwnProperty.call(patch, "x") || Object.prototype.hasOwnProperty.call(patch, "y")) {
      queuePositionPatch(selectedElement.id);
    }
    setHasUnsavedChanges(true);
  };

  const deleteSelected = () => {
    if (!selectedElement) return;
    setElements((previous) => previous.filter((item) => item.id !== selectedElement.id));
    setSelectedElementId(null);
    setHasUnsavedChanges(true);
  };

  const handleCanvasElementChange = useCallback(
    (elementId, patch) => {
      if (!patch || !elementId) return;
      const hasPositionChange =
        Object.prototype.hasOwnProperty.call(patch, "x") || Object.prototype.hasOwnProperty.call(patch, "y");

      if (hasPositionChange) {
        queuePositionPatch(elementId);
      }
      setHasUnsavedChanges(true);
    },
    [queuePositionPatch]
  );

  const handleCanvasElementsChange = useCallback((updater) => {
    setElements((previous) => {
      if (typeof updater === "function") {
        return updater(previous);
      }
      return updater;
    });
    setHasUnsavedChanges(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-slate-600">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        <span>Loading template...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-2 px-2 py-2 md:px-3 md:py-3">
      <Toaster position="top-center" />

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      <TopToolbar
        templateName={templateData.templateName}
        orientation={templateData.orientation}
        onTemplateNameChange={(value) => {
          setTemplateData((previous) => ({ ...previous, templateName: value }));
          setHasUnsavedChanges(true);
        }}
        onOrientationChange={(value) => {
          setTemplateData((previous) => ({ ...previous, orientation: value }));
          setHasUnsavedChanges(true);
        }}
        onBackgroundUpload={handleBackgroundUpload}
        hasUnsavedChanges={hasUnsavedChanges}
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode((previous) => !previous)}
        onSaveTemplate={handleSaveTemplate}
        isSaveDisabled={isSaveDisabled}
        isSaving={isSaving}
      />

      <RightPropertiesPanel
        selectedElement={selectedElement}
        onSelectedElementChange={updateSelectedElement}
        onDeleteSelectedElement={deleteSelected}
      />

      <div className="flex min-w-0 flex-col gap-2 xl:flex-row">
        <div className="xl:w-[220px] xl:flex-shrink-0">
          <LeftSidebar onAddElement={handleAddElement} />
        </div>

        <div className="min-w-0 flex-1">
          <CanvasArea
            orientation={templateData.orientation}
            backgroundUrl={backgroundUrl}
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={(element) => setSelectedElementId(element?.id || null)}
            onElementsChange={handleCanvasElementsChange}
            onElementChange={handleCanvasElementChange}
            previewMode={isPreviewMode}
            templateStyle={templateData}
            uploadCanvasRef={uploadRenderCanvasRef}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="h-9 rounded-lg border border-emerald-300 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          Export PDF
        </button>
      </div>

      {isExportModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Generate Certificate PDF</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a student to generate PDF.</p>

            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="mt-3 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
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

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="h-9 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleGeneratePdf();
                  setIsExportModalOpen(false);
                }}
                disabled={isGeneratingPdf || !id}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingPdf ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-white" /> : null}
                {isGeneratingPdf ? "Generating..." : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CertificateBuilder;
