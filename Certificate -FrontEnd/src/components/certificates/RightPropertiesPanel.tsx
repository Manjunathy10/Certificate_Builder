import FloatingTextToolbar from "./FloatingTextToolbar";

interface CertificateElement {
  id: string;
  elementType?: string;
  value?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  fontColor?: string;
  bold?: boolean;
  italic?: boolean;
}

interface RightPropertiesPanelProps {
  selectedElement: CertificateElement | null;
  onSelectedElementChange: (patch: Partial<CertificateElement>) => void;
  onDeleteSelectedElement: () => void;
}

export default function RightPropertiesPanel({
  selectedElement,
  onSelectedElementChange,
  onDeleteSelectedElement,
}: RightPropertiesPanelProps) {
  return (
    <section className="w-full overflow-x-auto pb-1">
      <div className="flex w-full justify-start md:justify-center">
        {selectedElement ? (
          <FloatingTextToolbar
            selectedElement={selectedElement}
            onChange={onSelectedElementChange}
            onDelete={onDeleteSelectedElement}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            Select an element to edit style properties.
          </div>
        )}
      </div>
    </section>
  );
}
