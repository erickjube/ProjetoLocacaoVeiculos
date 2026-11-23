import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import type { Marca } from "../../models/Marca";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";

export function MarcaList() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [marcaExcluir, setMarcaExcluir] = useState<Marca | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      setMarcas(await marcaService.listar());
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar as marcas." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!marcaExcluir?.id) {
      return;
    }
    const { id, nome } = marcaExcluir;
    setMarcaExcluir(null);
    const modelos = await modeloService.listarPorMarca(id);
    if (modelos.length > 0) {
      setAlerta({
        type: "danger",
        message: `A marca ${nome} possui ${modelos.length} modelo(s) vinculado(s) e não pode ser excluída.`,
      });
      return;
    }
    await marcaService.excluir(id);
    setAlerta({ type: "success", message: "Marca excluída com sucesso." });
    carregar();
  }

  const columns: Column<Marca>[] = [{ header: "Nome", render: (marca) => marca.nome }];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Marcas</h2>
        <Button label="Nova marca" onClick={() => navigate("/marcas/novo")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <Table
        columns={columns}
        data={marcas}
        onEdit={(marca) => navigate(`/marcas/${marca.id}`)}
        onDelete={setMarcaExcluir}
      />
      <Modal
        show={marcaExcluir !== null}
        title="Excluir marca"
        message={`Deseja realmente excluir a marca ${marcaExcluir?.nome}?`}
        onClose={() => setMarcaExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
