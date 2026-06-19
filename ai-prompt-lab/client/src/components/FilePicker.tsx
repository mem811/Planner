import { useRef } from 'react';

export default function FilePicker({
  multiple = false,
  accept = 'image/*',
  onFiles,
  label = 'Choose image(s)',
}: {
  multiple?: boolean;
  accept?: string;
  onFiles: (files: File[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(Array.from(e.dataTransfer.files));
      }}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-xl border-2 border-dashed border-line bg-panel p-8 text-center text-sm text-ink-soft transition hover:border-brand hover:bg-brand-soft"
    >
      <p>{label}</p>
      <p className="mt-1 text-xs">or drag and drop here</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
    </div>
  );
}
