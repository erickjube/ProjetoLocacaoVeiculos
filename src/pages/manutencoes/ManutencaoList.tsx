import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Select } from "../../components/Select";
import { Table, type Column } from "../../components/Table";
import type { Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";

export function ManutencaoList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const veiculoId = searchParams.get("veiculoId") ?? "";
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [manutencaoExcluir, setManutencaoExcluir] = useState<Manutencao | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      const [listaManutencoes, listaVeiculos] = await Promise.all([
        manutencaoService.listar(),
        veiculoService.listar(),
      ]);
      setManutencoes(listaManutencoes);
      setVeiculos(listaVeiculos);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar as manutenções." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleFiltroChange(event: ChangeEvent<HTMLSelectElement>) {
    setSearchParams(event.target.value ? { veiculoId: event.target.value } : {});
  }

  async function confirmarExclusao() {
    if (!manutencaoExcluir?.id) {
      return;
    }
    const id = manutencaoExcluir.id;
    setManutencaoExcluir(null);
    await manutencaoService.excluir(id);
    setAlerta({ type: "success", message: "Manutenção excluída com sucesso." });
    carregar();
  }

  const manutencoesFiltradas = manutencoes
    .filter((manutencao) => !veiculoId || manutencao.veiculoId === veiculoId)
    .sort((a, b) => b.data.localeCompare(a.data));

  const columns: Column<Manutencao>[] = [
    { header: "Data", render: (manutencao) => new Date(`${manutencao.data}T00:00`).toLocaleDateString("pt-BR") },
    { header: "Veículo", render: (manutencao) => veiculos.find((v) => v.id === manutencao.veiculoId)?.placa },
    { header: "Descrição", render: (manutencao) => manutencao.descricao },
    {
      header: "Valor",
      render: (manutencao) => manutencao.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Manutenções</h2>
        <Button
          label="Nova manutenção"
          onClick={() => navigate(veiculoId ? `/manutencoes/novo?veiculoId=${veiculoId}` : "/manutencoes/novo")}
        />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <div className="row">
        <div className="col-12 col-md-6">
          <Select
            label="Histórico do veículo"
            name="veiculoId"
            value={veiculoId}
            placeholder="Todos os veículos"
            options={veiculos.map((veiculo) => ({ value: veiculo.id ?? "", label: veiculo.placa }))}
            onChange={handleFiltroChange}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={manutencoesFiltradas}
        onEdit={(manutencao) => navigate(`/manutencoes/${manutencao.id}`)}
        onDelete={setManutencaoExcluir}
      />
      <Modal
        show={manutencaoExcluir !== null}
        title="Excluir manutenção"
        message="Deseja realmente excluir esta manutenção?"
        onClose={() => setManutencaoExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
