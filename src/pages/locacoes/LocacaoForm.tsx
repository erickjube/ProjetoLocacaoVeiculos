import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import type { Categoria } from "../../models/Categoria";
import { cnhVencida, type Cliente } from "../../models/Cliente";
import { gerarNumeroContrato, termosPadraoContrato } from "../../models/Contrato";
import { calcularNumeroDiarias, calcularValorLocacao, locacaoInicial, type Locacao } from "../../models/Locacao";
import type { Manutencao } from "../../models/Manutencao";
import type { Modelo } from "../../models/Modelo";
import { calcularStatusVeiculo, type Veiculo } from "../../models/Veiculo";
import { niveisCombustivel, vistoriaInicial, type NivelCombustivel, type Vistoria } from "../../models/Vistoria";
import { categoriaService } from "../../service/categoriaService";
import { clienteService } from "../../service/clienteService";
import { contratoService } from "../../service/contratoService";
import { locacaoService } from "../../service/locacaoService";
import { manutencaoService } from "../../service/manutencaoService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

type Erros = Partial<Record<keyof Locacao | keyof Vistoria, string>>;

export function LocacaoForm() {
  const navigate = useNavigate();
  const [locacao, setLocacao] = useState<Locacao>(locacaoInicial);
  const [vistoria, setVistoria] = useState<Vistoria>(vistoriaInicial);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    clienteService.listar().then(setClientes);
    veiculoService.listar().then(setVeiculos);
    modeloService.listar().then(setModelos);
    categoriaService.listar().then(setCategorias);
    locacaoService.listar().then(setLocacoes);
    manutencaoService.listar().then(setManutencoes);
  }, []);

  const veiculosDisponiveis = veiculos.filter(
    (veiculo) => calcularStatusVeiculo(veiculo, locacoes, manutencoes) === "DISPONIVEL",
  );

  function buscarCategoria(veiculoId: string): Categoria | undefined {
    const veiculo = veiculos.find((v) => v.id === veiculoId);
    const modelo = modelos.find((m) => m.id === veiculo?.modeloId);
    return categorias.find((c) => c.id === modelo?.categoriaId);
  }

  const categoria = buscarCategoria(locacao.veiculoId);
  const datasValidas =
    locacao.dataRetirada !== "" &&
    locacao.dataDevolucaoPrevista !== "" &&
    locacao.dataDevolucaoPrevista > locacao.dataRetirada;
  const valorPrevisto =
    categoria && datasValidas
      ? calcularValorLocacao(locacao.dataRetirada, locacao.dataDevolucaoPrevista, categoria.valorLocacao)
      : 0;

  function handleLocacaoChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    if (name === "veiculoId") {
      const veiculo = veiculos.find((v) => v.id === value);
      setLocacao({ ...locacao, veiculoId: value, kmRetirada: veiculo?.kmRodado ?? 0 });
      return;
    }
    setLocacao({ ...locacao, [name]: name === "kmRetirada" ? Number(value) : value });
  }

  function handleNivelCombustivelChange(event: ChangeEvent<HTMLSelectElement>) {
    setVistoria({ ...vistoria, nivelCombustivel: event.target.value as NivelCombustivel });
  }

  function handleObservacoesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setVistoria({ ...vistoria, observacoes: event.target.value });
  }

  async function validar(): Promise<boolean> {
    const novosErros: Erros = {};
    if (!locacao.clienteId) {
      novosErros.clienteId = "Selecione o cliente.";
    }
    if (!locacao.veiculoId) {
      novosErros.veiculoId = "Selecione o veículo.";
    }
    if (!locacao.dataRetirada) {
      novosErros.dataRetirada = "Informe a data de retirada.";
    }
    if (!locacao.dataDevolucaoPrevista) {
      novosErros.dataDevolucaoPrevista = "Informe a data de devolução prevista.";
    } else if (locacao.dataDevolucaoPrevista <= locacao.dataRetirada) {
      novosErros.dataDevolucaoPrevista = "A devolução prevista deve ser posterior à data de retirada.";
    }
    if (locacao.kmRetirada < 0) {
      novosErros.kmRetirada = "A quilometragem não pode ser negativa.";
    }
    if (!vistoria.nivelCombustivel) {
      novosErros.nivelCombustivel = "Selecione o nível de combustível.";
    }

    const cliente = clientes.find((c) => c.id === locacao.clienteId);
    if (cliente && cnhVencida(cliente)) {
      novosErros.clienteId = "A CNH deste cliente está vencida. Não é possível registrar a locação.";
    }

    if (locacao.veiculoId) {
      const locacoesVeiculo = await locacaoService.listarPorVeiculo(locacao.veiculoId);
      if (locacoesVeiculo.some((l) => l.status === "ABERTA")) {
        novosErros.veiculoId = "Este veículo já possui uma locação em aberto.";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (!(await validar())) {
        return;
      }
      const novaLocacao = await locacaoService.criar({ ...locacao, valorTotal: valorPrevisto, status: "ABERTA" });
      const locacaoId = novaLocacao.id ?? "";

      const contratos = await contratoService.listar();
      await contratoService.criar({
        numero: gerarNumeroContrato(contratos.length),
        dataEmissao: new Date().toLocaleDateString("en-CA"),
        termos: termosPadraoContrato,
        locacaoId,
      });

      await vistoriaService.criar({
        ...vistoria,
        tipo: "RETIRADA",
        data: locacao.dataRetirada,
        km: locacao.kmRetirada,
        locacaoId,
      });

      navigate(`/locacoes/${locacaoId}`);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível registrar a locação." });
    }
  }

  return (
    <>
      <h2 className="mb-3">Nova locação</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <h5 className="mb-3">Dados da locação</h5>
        <div className="row">
          <div className="col-12 col-md-6">
            <Select
              label="Cliente"
              name="clienteId"
              value={locacao.clienteId}
              options={clientes.map((cliente) => ({
                value: cliente.id ?? "",
                label: cnhVencida(cliente) ? `${cliente.nome} (CNH vencida)` : cliente.nome,
              }))}
              onChange={handleLocacaoChange}
              error={erros.clienteId}
            />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Veículo disponível"
              name="veiculoId"
              value={locacao.veiculoId}
              options={veiculosDisponiveis.map((veiculo) => {
                const modelo = modelos.find((m) => m.id === veiculo.modeloId);
                return { value: veiculo.id ?? "", label: `${veiculo.placa} - ${modelo?.nome ?? ""}` };
              })}
              onChange={handleLocacaoChange}
              error={erros.veiculoId}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Data de retirada"
              name="dataRetirada"
              type="datetime-local"
              value={locacao.dataRetirada}
              onChange={handleLocacaoChange}
              error={erros.dataRetirada}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Data de devolução prevista"
              name="dataDevolucaoPrevista"
              type="datetime-local"
              value={locacao.dataDevolucaoPrevista}
              onChange={handleLocacaoChange}
              error={erros.dataDevolucaoPrevista}
            />
          </div>
        </div>

        <div className="alert alert-info">
          <div>Categoria: {categoria ? categoria.nome : "-"}</div>
          <div>
            Valor da diária:{" "}
            {categoria ? categoria.valorLocacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}
          </div>
          <div>
            Nº de diárias:{" "}
            {datasValidas ? calcularNumeroDiarias(locacao.dataRetirada, locacao.dataDevolucaoPrevista) : "-"}
          </div>
          <div className="fw-semibold">
            Valor previsto: {valorPrevisto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>

        <h5 className="mb-3">Vistoria de retirada</h5>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input
              label="Km de retirada"
              name="kmRetirada"
              type="number"
              value={locacao.kmRetirada}
              onChange={handleLocacaoChange}
              error={erros.kmRetirada}
            />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Nível de combustível"
              name="nivelCombustivel"
              value={vistoria.nivelCombustivel}
              options={niveisCombustivel.map((nivel) => ({ value: nivel, label: nivel }))}
              onChange={handleNivelCombustivelChange}
              error={erros.nivelCombustivel}
            />
          </div>
          <div className="col-12">
            <TextArea
              label="Observações"
              name="observacoes"
              value={vistoria.observacoes}
              onChange={handleObservacoesChange}
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button label="Registrar locação" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/locacoes")} />
        </div>
      </form>
    </>
  );
}
