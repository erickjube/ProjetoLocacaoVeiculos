import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import type { Marca } from "../../models/Marca";
import type { Modelo } from "../../models/Modelo";
import { veiculoInicial, type Veiculo } from "../../models/Veiculo";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";
import { veiculoService } from "../../service/veiculoService";

type Erros = Partial<Record<keyof Veiculo, string>>;

export function VeiculoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [veiculo, setVeiculo] = useState<Veiculo>(veiculoInicial);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    modeloService.listar().then(setModelos);
    marcaService.listar().then(setMarcas);
    if (id) {
      veiculoService.buscarPorId(id).then(setVeiculo);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    setVeiculo({ ...veiculo, [name]: type === "number" ? Number(value) : value });
  }

  async function validar(): Promise<boolean> {
    const novosErros: Erros = {};
    if (!veiculo.placa.trim()) {
      novosErros.placa = "Informe a placa.";
    }
    if (!veiculo.chassi.trim()) {
      novosErros.chassi = "Informe o chassi.";
    }
    if (!veiculo.cor.trim()) {
      novosErros.cor = "Informe a cor.";
    }
    if (veiculo.anoFabricacao <= 0) {
      novosErros.anoFabricacao = "Informe um ano válido.";
    }
    if (veiculo.kmRodado < 0) {
      novosErros.kmRodado = "A quilometragem não pode ser negativa.";
    }
    if (!veiculo.modeloId) {
      novosErros.modeloId = "Selecione o modelo.";
    }

    const outrosVeiculos = (await veiculoService.listar()).filter((v) => v.id !== id);
    if (outrosVeiculos.some((v) => v.placa.toUpperCase() === veiculo.placa.trim().toUpperCase())) {
      novosErros.placa = "Já existe um veículo cadastrado com esta placa.";
    }
    if (outrosVeiculos.some((v) => v.chassi.toUpperCase() === veiculo.chassi.trim().toUpperCase())) {
      novosErros.chassi = "Já existe um veículo cadastrado com este chassi.";
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
      const dados: Veiculo = {
        ...veiculo,
        placa: veiculo.placa.trim().toUpperCase(),
        chassi: veiculo.chassi.trim().toUpperCase(),
      };
      if (id) {
        await veiculoService.atualizar(id, dados);
      } else {
        await veiculoService.criar(dados);
      }
      navigate("/veiculos");
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar o veículo." });
    }
  }

  const opcoesModelos = modelos.map((modelo) => {
    const marca = marcas.find((m) => m.id === modelo.marcaId);
    return { value: modelo.id ?? "", label: `${marca?.nome ?? ""} ${modelo.nome} (${modelo.ano})` };
  });

  return (
    <>
      <h2 className="mb-3">{id ? "Editar veículo" : "Novo veículo"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Select
              label="Modelo"
              name="modeloId"
              value={veiculo.modeloId}
              options={opcoesModelos}
              onChange={handleChange}
              error={erros.modeloId}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input label="Placa" name="placa" value={veiculo.placa} onChange={handleChange} error={erros.placa} />
          </div>
          <div className="col-12 col-md-6">
            <Input label="Chassi" name="chassi" value={veiculo.chassi} onChange={handleChange} error={erros.chassi} />
          </div>
          <div className="col-12 col-md-6">
            <Input label="Cor" name="cor" value={veiculo.cor} onChange={handleChange} error={erros.cor} />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Ano de fabricação"
              name="anoFabricacao"
              type="number"
              value={veiculo.anoFabricacao}
              onChange={handleChange}
              error={erros.anoFabricacao}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Km rodado"
              name="kmRodado"
              type="number"
              value={veiculo.kmRodado}
              onChange={handleChange}
              error={erros.kmRodado}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/veiculos")} />
        </div>
      </form>
    </>
  );
}
