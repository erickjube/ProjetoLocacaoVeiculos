import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="card h-100">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}
