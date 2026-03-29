import type { ChangeEventHandler } from "react";

interface TopToolbarProps {
  templateName: string;
  orientation: string;
  onTemplateNameChange: (value: string) => void;
  onOrientationChange: (value: string) => void;
  onBackgroundUpload: ChangeEventHandler<HTMLInputElement>;
  hasUnsavedChanges: boolean;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onSaveTemplate: () => void;
  isSaveDisabled: boolean;
  isSaving: boolean;
}

export default function TopToolbar({
  templateName,
  orientation,
  onTemplateNameChange,
  onOrientationChange,
  onBackgroundUpload,
  hasUnsavedChanges,
  isPreviewMode,
  onTogglePreview,
  onSaveTemplate,
  isSaveDisabled,
  isSaving,
}: TopToolbarProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        <input
          type="text"
          placeholder="Template name"
          value={templateName}
          onChange={(event) => onTemplateNameChange(event.target.value)}
          className="h-9 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        />

        <select
          value={orientation}
          onChange={(event) => onOrientationChange(event.target.value)}
          className="h-9 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>

        <label className="flex h-9 cursor-pointer items-center justify-between rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          <span>Upload background</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            onChange={onBackgroundUpload}
            className="hidden"
          />
          <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">Browse</span>
        </label>

      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {hasUnsavedChanges ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">Unsaved changes</span>
        ) : null}

        <button
          type="button"
          onClick={onTogglePreview}
          className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {isPreviewMode ? "Hide Preview" : "Preview"}
        </button>

        <button
          type="button"
          onClick={onSaveTemplate}
          disabled={isSaveDisabled}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" /> : null}
          {isSaving ? "Saving..." : "Save Template"}
        </button>
      </div>
    </section>
  );
}
