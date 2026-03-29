import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const PDF_MIME_TYPE = "application/pdf";

export type UploadFileType = "image" | "pdf";

export interface PDFRenderOptions {
  pageNumber?: number;
  maxDimension?: number;
  scale?: number;
}

export interface FileUploadOptions extends PDFRenderOptions {
  imageMaxDimension?: number;
}

export interface FileUploadResult {
  type: UploadFileType;
  backgroundUrl: string;
  width: number;
  height: number;
  pageNumber?: number;
}

function fileNameLooksLikePdf(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}

function fileNameLooksLikeImage(fileName: string): boolean {
  return /\.(jpe?g|png)$/i.test(fileName);
}

export function detectUploadFileType(file: File): UploadFileType | null {
  if (SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return "image";
  }

  if (file.type === PDF_MIME_TYPE) {
    return "pdf";
  }

  // Fallback to extension checks for browsers that omit MIME type.
  if (fileNameLooksLikePdf(file.name)) {
    return "pdf";
  }

  if (fileNameLooksLikeImage(file.name)) {
    return "image";
  }

  return null;
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    throw new Error("Canvas 2D context is not available.");
  }
  return context;
}

async function canvasToObjectUrl(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Failed to convert canvas content to Blob."));
          return;
        }
        resolve(result);
      },
      "image/png",
      0.95
    );
  });

  return URL.createObjectURL(blob);
}

function constrainDimensions(width: number, height: number, maxDimension: number): { width: number; height: number } {
  if (maxDimension <= 0) {
    return { width, height };
  }

  const maxOriginal = Math.max(width, height);
  if (maxOriginal <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / maxOriginal;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load selected image."));
      img.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function renderImageToCanvas(
  file: File,
  canvas: HTMLCanvasElement,
  maxDimension = 1800
): Promise<Omit<FileUploadResult, "type">> {
  const image = await loadImageFromFile(file);
  const { width, height } = constrainDimensions(image.naturalWidth, image.naturalHeight, maxDimension);

  const context = get2dContext(canvas);
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const backgroundUrl = await canvasToObjectUrl(canvas);
  return { backgroundUrl, width, height };
}

export async function renderPDFToCanvas(
  file: File,
  canvas: HTMLCanvasElement,
  options: PDFRenderOptions = {}
): Promise<Omit<FileUploadResult, "type">> {
  const pageNumber = Math.max(1, options.pageNumber ?? 1);
  const maxDimension = options.maxDimension ?? 2000;
  const customScale = options.scale ?? 1;

  const pdfData = await file.arrayBuffer();
  const loadingTask = getDocument({ data: pdfData, useSystemFonts: true });

  let pdfDocument: Awaited<typeof loadingTask.promise> | null = null;
  try {
    pdfDocument = await loadingTask.promise;
    if (pageNumber > pdfDocument.numPages) {
      throw new Error(`Page ${pageNumber} is out of range. This PDF has ${pdfDocument.numPages} pages.`);
    }

    const page = await pdfDocument.getPage(pageNumber);
    const initialViewport = page.getViewport({ scale: 1 });

    const constrained = constrainDimensions(initialViewport.width, initialViewport.height, maxDimension);
    const fitScale = constrained.width / initialViewport.width;
    const finalScale = Math.max(0.1, Math.min(customScale, fitScale));

    const viewport = page.getViewport({ scale: finalScale });
    const context = get2dContext(canvas);

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const renderTask = page.render({ canvas: canvas, canvasContext: context, viewport });
    await renderTask.promise;

    const backgroundUrl = await canvasToObjectUrl(canvas);
    await page.cleanup();

    return {
      backgroundUrl,
      width: canvas.width,
      height: canvas.height,
      pageNumber,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to render PDF.";
    throw new Error(message);
  } finally {
    if (pdfDocument) {
      await pdfDocument.cleanup();
      await pdfDocument.destroy();
    }
  }
}

export async function handleFileUpload(
  file: File,
  canvas: HTMLCanvasElement,
  options: FileUploadOptions = {}
): Promise<FileUploadResult> {
  const fileType = detectUploadFileType(file);
  if (!fileType) {
    throw new Error("Unsupported file type. Please upload JPG, JPEG, PNG, or PDF.");
  }

  if (fileType === "pdf") {
    const rendered = await renderPDFToCanvas(file, canvas, options);
    return {
      type: "pdf",
      ...rendered,
    };
  }

  const rendered = await renderImageToCanvas(file, canvas, options.imageMaxDimension ?? 1800);
  return {
    type: "image",
    ...rendered,
  };
}
