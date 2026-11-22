interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  type?: "button" | "submit";
  size?: "sm" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ label, variant = "primary", type = "button", size, disabled, onClick }: ButtonProps) {
  const classeTamanho = size ? ` btn-${size}` : "";
  return (
    <button type={type} className={`btn btn-${variant}${classeTamanho}`} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}
