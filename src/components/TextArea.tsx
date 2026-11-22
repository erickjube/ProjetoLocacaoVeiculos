import type { ChangeEvent } from "react";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export function TextArea({ label, name, value, onChange, rows = 3 }: TextAreaProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="form-control" />
    </div>
  );
}
