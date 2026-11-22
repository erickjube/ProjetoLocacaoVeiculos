import type { ChangeEvent } from "react";

interface InputProps {
  label: string;
  name: string;
  type?: "text" | "number" | "date" | "datetime-local" | "email" | "tel";
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  step?: string;
}

export function Input({ label, name, type = "text", value, onChange, placeholder, error, step }: InputProps) {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className={`form-control${error ? " is-invalid" : ""}`}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
