import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import type { Categoria } from "../../models/Categoria";
import { categoriaService } from "../../service/categoriaService";
import { modeloService } from "../../service/modeloService";

export function CategoriaList() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaExcluir, setCategoriaExcluir] = useState<Categoria | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      setCategorias(await categoriaService.listar());
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar as categorias." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!categoriaExcluir?.id) {
      return;
    }
    const { id, nome } = categoriaExcluir;
    setCategoriaExcluir(null);
    const modelos = await modeloService.listarPorCategoria(id);
    if (modelos.length > 0) {
      setAlerta({
        type: "danger",
        message: `A categoria ${nome} possui ${modelos.length} modelo(s) vinculado(s) e não pode ser excluída.`,
      });
      return;
    }
    await categoriaService.excluir(id);
    setAlerta({ type: "success", message: "Categoria excluída com sucesso." });
    carregar();
  }

  const columns: Column<Categoria>[] = [
    { header: "Nome", render: (categoria) => categoria.nome },
    {
      header: "Valor da diária",
      render: (categoria) => categoria.valorLocacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Categorias</h2>
        <Button label="Nova categoria" onClick={() => navigate("/categorias/novo")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <Table
        columns={columns}
        data={categorias}
        onEdit={(categoria) => navigate(`/categorias/${categoria.id}`)}
        onDelete={setCategoriaExcluir}
      />
      <Modal
        show={categoriaExcluir !== null}
        title="Excluir categoria"
        message={`Deseja realmente excluir a categoria ${categoriaExcluir?.nome}?`}
        onClose={() => setCategoriaExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
