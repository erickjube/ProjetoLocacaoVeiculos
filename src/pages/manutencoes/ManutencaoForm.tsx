import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { manutencaoInicial, type Manutencao } from "../../models/Manutencao";
import type { Veiculo } from "../../models/Veiculo";
import { manutencaoService } from "../../service/manutencaoService";
import { veiculoService } from "../../service/veiculoService";

type Erros = Partial<Record<keyof Manutencao, string>>;

export function ManutencaoForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [manutencao, setManutencao] = useState<Manutencao>({
    ...manutencaoInicial,
    veiculoId: searchParams.get("veiculoId") ?? "",
  });
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    veiculoService.listar().then(setVeiculos);
    if (id) {
      manutencaoService.buscarPorId(id).then(setManutencao);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    setManutencao({ ...manutencao, [name]: type === "number" ? Number(value) : value });
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!manutencao.veiculoId) {
      novosErros.veiculoId = "Selecione o veículo.";
    }
    if (!manutencao.data) {
      novosErros.data = "Informe a data.";
    }
    if (!manutencao.descricao.trim()) {
      novosErros.descricao = "Informe a descrição.";
    }
    if (manutencao.valor < 0) {
      novosErros.valor = "O valor não pode ser negativo.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validar()) {
      return;
    }
    try {
      if (id) {
        await manutencaoService.atualizar(id, manutencao);
      } else {
        await manutencaoService.criar(manutencao);
      }
      navigate(`/manutencoes?veiculoId=${manutencao.veiculoId}`);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar a manutenção." });
    }
  }

  return (
    <>
      <h2 className="mb-3">{id ? "Editar manutenção" : "Nova manutenção"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Select
              label="Veículo"
              name="veiculoId"
              value={manutencao.veiculoId}
              options={veiculos.map((veiculo) => ({ value: veiculo.id ?? "", label: veiculo.placa }))}
              onChange={handleChange}
              error={erros.veiculoId}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Data"
              name="data"
              type="date"
              value={manutencao.data}
              onChange={handleChange}
              error={erros.data}
            />
          </div>
          <div className="col-12 col-md-8">
            <Input
              label="Descrição"
              name="descricao"
              value={manutencao.descricao}
              onChange={handleChange}
              error={erros.descricao}
            />
          </div>
          <div className="col-12 col-md-4">
            <Input
              label="Valor (R$)"
              name="valor"
              type="number"
              step="0.01"
              value={manutencao.valor}
              onChange={handleChange}
              error={erros.valor}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/manutencoes")} />
        </div>
      </form>
    </>
  );
}
