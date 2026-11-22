import type { ReactNode } from "react";
import { Button } from "./Button";

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function Table<T extends { id?: string }>({ columns, data, onEdit, onDelete }: TableProps<T>) {
  const possuiAcoes = Boolean(onEdit || onDelete);

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
            {possuiAcoes && <th className="text-end">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (possuiAcoes ? 1 : 0)} className="text-center text-muted">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.header}>{column.render(item)}</td>
              ))}
              {possuiAcoes && (
                <td className="text-end text-nowrap">
                  <div className="d-inline-flex gap-2">
                    {onEdit && <Button label="Editar" variant="warning" size="sm" onClick={() => onEdit(item)} />}
                    {onDelete && <Button label="Excluir" variant="danger" size="sm" onClick={() => onDelete(item)} />}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
