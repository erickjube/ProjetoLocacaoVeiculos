import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import type { Categoria } from "../../models/Categoria";
import type { Marca } from "../../models/Marca";
import { modeloInicial, type Modelo } from "../../models/Modelo";
import { categoriaService } from "../../service/categoriaService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";

type Erros = Partial<Record<keyof Modelo, string>>;

export function ModeloForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modelo, setModelo] = useState<Modelo>(modeloInicial);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    marcaService.listar().then(setMarcas);
    categoriaService.listar().then(setCategorias);
    if (id) {
      modeloService.buscarPorId(id).then(setModelo);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    setModelo({ ...modelo, [name]: type === "number" ? Number(value) : value });
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!modelo.nome.trim()) {
      novosErros.nome = "Informe o nome do modelo.";
    }
    if (modelo.ano <= 0) {
      novosErros.ano = "Informe um ano válido.";
    }
    if (!modelo.marcaId) {
      novosErros.marcaId = "Selecione a marca.";
    }
    if (!modelo.categoriaId) {
      novosErros.categoriaId = "Selecione a categoria.";
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
        await modeloService.atualizar(id, modelo);
      } else {
        await modeloService.criar(modelo);
      }
      navigate("/modelos");
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar o modelo." });
    }
  }

  return (
    <>
      <h2 className="mb-3">{id ? "Editar modelo" : "Novo modelo"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-8">
            <Input label="Nome" name="nome" value={modelo.nome} onChange={handleChange} error={erros.nome} />
          </div>
          <div className="col-12 col-md-4">
            <Input label="Ano" name="ano" type="number" value={modelo.ano} onChange={handleChange} error={erros.ano} />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Marca"
              name="marcaId"
              value={modelo.marcaId}
              options={marcas.map((marca) => ({ value: marca.id ?? "", label: marca.nome }))}
              onChange={handleChange}
              error={erros.marcaId}
            />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Categoria"
              name="categoriaId"
              value={modelo.categoriaId}
              options={categorias.map((categoria) => ({ value: categoria.id ?? "", label: categoria.nome }))}
              onChange={handleChange}
              error={erros.categoriaId}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/modelos")} />
        </div>
      </form>
    </>
  );
}
