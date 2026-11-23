import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import type { Locacao } from "../../models/Locacao";
import type { Manutencao } from "../../models/Manutencao";
import type { Marca } from "../../models/Marca";
import type { Modelo } from "../../models/Modelo";
import { calcularStatusVeiculo, statusVeiculoLabel, type StatusVeiculo, type Veiculo } from "../../models/Veiculo";
import { locacaoService } from "../../service/locacaoService";
import { manutencaoService } from "../../service/manutencaoService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

const corStatus: Record<StatusVeiculo, string> = {
  DISPONIVEL: "success",
  LOCADO: "warning",
  EM_MANUTENCAO: "danger",
};

export function VeiculoList() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [veiculoExcluir, setVeiculoExcluir] = useState<Veiculo | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      const [listaVeiculos, listaModelos, listaMarcas, listaLocacoes, listaManutencoes] = await Promise.all([
        veiculoService.listar(),
        modeloService.listar(),
        marcaService.listar(),
        locacaoService.listar(),
        manutencaoService.listar(),
      ]);
      setVeiculos(listaVeiculos);
      setModelos(listaModelos);
      setMarcas(listaMarcas);
      setLocacoes(listaLocacoes);
      setManutencoes(listaManutencoes);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar os veículos." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function descricaoModelo(veiculo: Veiculo): string {
    const modelo = modelos.find((m) => m.id === veiculo.modeloId);
    const marca = marcas.find((m) => m.id === modelo?.marcaId);
    return modelo ? `${marca?.nome ?? ""} ${modelo.nome}` : "";
  }

  async function confirmarExclusao() {
    if (!veiculoExcluir?.id) {
      return;
    }
    const { id, placa } = veiculoExcluir;
    setVeiculoExcluir(null);
    const [manutencoesVeiculo, locacoesVeiculo] = await Promise.all([
      manutencaoService.listarPorVeiculo(id),
      locacaoService.listarPorVeiculo(id),
    ]);
    if (manutencoesVeiculo.length > 0 || locacoesVeiculo.length > 0) {
      setAlerta({
        type: "danger",
        message: `O veículo ${placa} possui manutenções ou locações vinculadas e não pode ser excluído.`,
      });
      return;
    }
    await veiculoService.excluir(id);
    setAlerta({ type: "success", message: "Veículo excluído com sucesso." });
    carregar();
  }

  const columns: Column<Veiculo>[] = [
    { header: "Placa", render: (veiculo) => veiculo.placa },
    { header: "Modelo", render: descricaoModelo },
    { header: "Cor", render: (veiculo) => veiculo.cor },
    { header: "Ano", render: (veiculo) => veiculo.anoFabricacao },
    { header: "Km rodado", render: (veiculo) => veiculo.kmRodado.toLocaleString("pt-BR") },
    {
      header: "Situação",
      render: (veiculo) => {
        const status = calcularStatusVeiculo(veiculo, locacoes, manutencoes);
        return <span className={`badge text-bg-${corStatus[status]}`}>{statusVeiculoLabel[status]}</span>;
      },
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Veículos</h2>
        <Button label="Novo veículo" onClick={() => navigate("/veiculos/novo")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <Table
        columns={columns}
        data={veiculos}
        onEdit={(veiculo) => navigate(`/veiculos/${veiculo.id}`)}
        onDelete={setVeiculoExcluir}
      />
      <Modal
        show={veiculoExcluir !== null}
        title="Excluir veículo"
        message={`Deseja realmente excluir o veículo ${veiculoExcluir?.placa}?`}
        onClose={() => setVeiculoExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
