import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { Table, type Column } from "../../components/Table";
import type { Cliente } from "../../models/Cliente";
import { corStatusLocacao, statusLocacaoLabel, type Locacao } from "../../models/Locacao";
import type { Veiculo } from "../../models/Veiculo";
import { clienteService } from "../../service/clienteService";
import { locacaoService } from "../../service/locacaoService";
import { veiculoService } from "../../service/veiculoService";

export function LocacaoList() {
  const navigate = useNavigate();
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    Promise.all([locacaoService.listar(), clienteService.listar(), veiculoService.listar()])
      .then(([listaLocacoes, listaClientes, listaVeiculos]) => {
        setLocacoes(listaLocacoes);
        setClientes(listaClientes);
        setVeiculos(listaVeiculos);
      })
      .catch(() => setAlerta({ type: "danger", message: "Não foi possível carregar as locações." }));
  }, []);

  const locacoesFiltradas = locacoes
    .filter((locacao) => !filtroStatus || locacao.status === filtroStatus)
    .filter((locacao) => !filtroCliente || locacao.clienteId === filtroCliente)
    .sort((a, b) => b.dataRetirada.localeCompare(a.dataRetirada));

  const columns: Column<Locacao>[] = [
    { header: "Cliente", render: (locacao) => clientes.find((c) => c.id === locacao.clienteId)?.nome },
    { header: "Veículo", render: (locacao) => veiculos.find((v) => v.id === locacao.veiculoId)?.placa },
    { header: "Retirada", render: (locacao) => new Date(locacao.dataRetirada).toLocaleString("pt-BR") },
    {
      header: "Devolução prevista",
      render: (locacao) => new Date(locacao.dataDevolucaoPrevista).toLocaleString("pt-BR"),
    },
    {
      header: "Valor",
      render: (locacao) => locacao.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      header: "Status",
      render: (locacao) => (
        <span className={`badge text-bg-${corStatusLocacao[locacao.status]}`}>
          {statusLocacaoLabel[locacao.status]}
        </span>
      ),
    },
    {
      header: "Detalhes",
      render: (locacao) => (
        <Button label="Ver" variant="info" size="sm" onClick={() => navigate(`/locacoes/${locacao.id}`)} />
      ),
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Locações</h2>
        <Button label="Nova locação" onClick={() => navigate("/locacoes/nova")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <div className="row">
        <div className="col-12 col-md-6">
          <Select
            label="Status"
            name="status"
            value={filtroStatus}
            placeholder="Todos"
            options={Object.entries(statusLocacaoLabel).map(([value, label]) => ({ value, label }))}
            onChange={(event) => setFiltroStatus(event.target.value)}
          />
        </div>
        <div className="col-12 col-md-6">
          <Select
            label="Cliente"
            name="clienteId"
            value={filtroCliente}
            placeholder="Todos"
            options={clientes.map((cliente) => ({ value: cliente.id ?? "", label: cliente.nome }))}
            onChange={(event) => setFiltroCliente(event.target.value)}
          />
        </div>
      </div>
      <Table columns={columns} data={locacoesFiltradas} />
    </>
  );
}
