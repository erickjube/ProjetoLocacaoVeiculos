import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import type { Categoria } from "../../models/Categoria";
import { calcularNumeroDiarias, calcularValorLocacao, type Locacao } from "../../models/Locacao";
import type { Veiculo } from "../../models/Veiculo";
import { niveisCombustivel, vistoriaInicial, type NivelCombustivel, type Vistoria } from "../../models/Vistoria";
import { categoriaService } from "../../service/categoriaService";
import { locacaoService } from "../../service/locacaoService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

type Erros = Partial<Record<keyof Vistoria, string>>;

export function DevolucaoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [locacao, setLocacao] = useState<Locacao | null>(null);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [vistoria, setVistoria] = useState<Vistoria>({ ...vistoriaInicial, tipo: "DEVOLUCAO" });
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    async function carregar(locacaoId: string) {
      const dadosLocacao = await locacaoService.buscarPorId(locacaoId);
      const dadosVeiculo = await veiculoService.buscarPorId(dadosLocacao.veiculoId);
      const dadosModelo = await modeloService.buscarPorId(dadosVeiculo.modeloId);
      setLocacao(dadosLocacao);
      setVeiculo(dadosVeiculo);
      setCategoria(await categoriaService.buscarPorId(dadosModelo.categoriaId));
      setVistoria((atual) => ({ ...atual, km: dadosLocacao.kmRetirada, locacaoId }));
    }
    if (id) {
      carregar(id).catch(() => setAlerta({ type: "danger", message: "Não foi possível carregar a locação." }));
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setVistoria({ ...vistoria, [name]: name === "km" ? Number(value) : value });
  }

  function handleNivelCombustivelChange(event: ChangeEvent<HTMLSelectElement>) {
    setVistoria({ ...vistoria, nivelCombustivel: event.target.value as NivelCombustivel });
  }

  if (!locacao || !veiculo || !categoria) {
    return alerta ? <Alert type={alerta.type} message={alerta.message} /> : <p>Carregando...</p>;
  }

  const dataValida = vistoria.data !== "" && vistoria.data > locacao.dataRetirada;
  const valorRecalculado = dataValida
    ? calcularValorLocacao(locacao.dataRetirada, vistoria.data, categoria.valorLocacao)
    : locacao.valorTotal;

  function validar(dadosLocacao: Locacao): boolean {
    const novosErros: Erros = {};
    if (!vistoria.data) {
      novosErros.data = "Informe a data de devolução.";
    } else if (vistoria.data <= dadosLocacao.dataRetirada) {
      novosErros.data = "A data de devolução deve ser posterior à data de retirada.";
    }
    if (vistoria.km < dadosLocacao.kmRetirada) {
      novosErros.km = `O km de devolução não pode ser menor que o km de retirada (${dadosLocacao.kmRetirada}).`;
    }
    if (!vistoria.nivelCombustivel) {
      novosErros.nivelCombustivel = "Selecione o nível de combustível.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !locacao || !veiculo?.id) {
      return;
    }
    if (locacao.status !== "ABERTA") {
      setAlerta({ type: "warning", message: "Somente locações em aberto podem ser finalizadas." });
      return;
    }
    if (!validar(locacao)) {
      return;
    }
    try {
      await vistoriaService.criar({ ...vistoria, tipo: "DEVOLUCAO", locacaoId: id });
      await locacaoService.atualizar(id, {
        ...locacao,
        dataDevolucaoReal: vistoria.data,
        kmDevolucao: vistoria.km,
        valorTotal: valorRecalculado,
        status: "FINALIZADA",
      });
      await veiculoService.atualizar(veiculo.id, { ...veiculo, kmRodado: vistoria.km });
      navigate(`/locacoes/${id}`);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível finalizar a locação." });
    }
  }

  return (
    <>
      <h2 className="mb-3">Devolução do veículo {veiculo.placa}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <div className="alert alert-info">
        <div>Retirada: {new Date(locacao.dataRetirada).toLocaleString("pt-BR")}</div>
        <div>Devolução prevista: {new Date(locacao.dataDevolucaoPrevista).toLocaleString("pt-BR")}</div>
        <div>Km de retirada: {locacao.kmRetirada.toLocaleString("pt-BR")}</div>
        <div>
          Diárias: {dataValida ? calcularNumeroDiarias(locacao.dataRetirada, vistoria.data) : "-"} x{" "}
          {categoria.valorLocacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
        <div className="fw-semibold">
          Valor total: {valorRecalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input
              label="Data de devolução real"
              name="data"
              type="datetime-local"
              value={vistoria.data}
              onChange={handleChange}
              error={erros.data}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Km de devolução"
              name="km"
              type="number"
              value={vistoria.km}
              onChange={handleChange}
              error={erros.km}
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
            <TextArea label="Observações" name="observacoes" value={vistoria.observacoes} onChange={handleChange} />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Finalizar locação" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate(`/locacoes/${id}`)} />
        </div>
      </form>
    </>
  );
}
