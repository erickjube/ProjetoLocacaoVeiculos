import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import type { Categoria } from "../../models/Categoria";
import type { Marca } from "../../models/Marca";
import type { Modelo } from "../../models/Modelo";
import { categoriaService } from "../../service/categoriaService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

export function ModeloList() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modeloExcluir, setModeloExcluir] = useState<Modelo | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      const [listaModelos, listaMarcas, listaCategorias] = await Promise.all([
        modeloService.listar(),
        marcaService.listar(),
        categoriaService.listar(),
      ]);
      setModelos(listaModelos);
      setMarcas(listaMarcas);
      setCategorias(listaCategorias);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar os modelos." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!modeloExcluir?.id) {
      return;
    }
    const { id, nome } = modeloExcluir;
    setModeloExcluir(null);
    const veiculos = await veiculoService.listarPorModelo(id);
    if (veiculos.length > 0) {
      setAlerta({
        type: "danger",
        message: `O modelo ${nome} possui ${veiculos.length} veículo(s) vinculado(s) e não pode ser excluído.`,
      });
      return;
    }
    await modeloService.excluir(id);
    setAlerta({ type: "success", message: "Modelo excluído com sucesso." });
    carregar();
  }

  const columns: Column<Modelo>[] = [
    { header: "Nome", render: (modelo) => modelo.nome },
    { header: "Ano", render: (modelo) => modelo.ano },
    { header: "Marca", render: (modelo) => marcas.find((m) => m.id === modelo.marcaId)?.nome },
    { header: "Categoria", render: (modelo) => categorias.find((c) => c.id === modelo.categoriaId)?.nome },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Modelos</h2>
        <Button label="Novo modelo" onClick={() => navigate("/modelos/novo")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <Table
        columns={columns}
        data={modelos}
        onEdit={(modelo) => navigate(`/modelos/${modelo.id}`)}
        onDelete={setModeloExcluir}
      />
      <Modal
        show={modeloExcluir !== null}
        title="Excluir modelo"
        message={`Deseja realmente excluir o modelo ${modeloExcluir?.nome}?`}
        onClose={() => setModeloExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
