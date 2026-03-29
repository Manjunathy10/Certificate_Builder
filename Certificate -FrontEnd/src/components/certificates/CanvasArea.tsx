import type { RefObject } from "react";
import Canvas from "./Canvas";

interface CertificateElement {
  id: string;
  elementType?: string;
  value?: string;
  staticValue?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  fontColor?: string;
  bold?: boolean;
  italic?: boolean;
  x?: number;
  y?: number;
}

interface TemplateStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  bold: boolean;
  italic: boolean;
}

interface CanvasAreaProps {
  orientation: string;
  backgroundUrl: string;
  elements: CertificateElement[];
  selectedElement: CertificateElement | null;
  onSelectElement: (element: CertificateElement | null) => void;
  onElementsChange: (updater: CertificateElement[] | ((previous: CertificateElement[]) => CertificateElement[])) => void;
  onElementChange: (elementId: string, patch: Partial<CertificateElement>) => void;
  previewMode: boolean;
  templateStyle: TemplateStyle;
  uploadCanvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function CanvasArea({
  orientation,
  backgroundUrl,
  elements,
  selectedElement,
  onSelectElement,
  onElementsChange,
  onElementChange,
  previewMode,
  templateStyle,
  uploadCanvasRef,
}: CanvasAreaProps) {
  return (
    <section className="min-w-0 flex-1">
      <Canvas
        orientation={orientation}
        backgroundUrl={backgroundUrl}
        elements={elements}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        onElementsChange={onElementsChange}
        onElementChange={onElementChange}
        previewMode={previewMode}
        templateStyle={templateStyle}
      />

      <canvas ref={uploadCanvasRef} className="hidden" aria-hidden="true" />
    </section>
  );
}
