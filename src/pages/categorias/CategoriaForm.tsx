import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { categoriaInicial, type Categoria } from "../../models/Categoria";
import { categoriaService } from "../../service/categoriaService";

type Erros = Partial<Record<keyof Categoria, string>>;

export function CategoriaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<Categoria>(categoriaInicial);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    if (id) {
      categoriaService.buscarPorId(id).then(setCategoria);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = event.target;
    setCategoria({ ...categoria, [name]: type === "number" ? Number(value) : value });
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!categoria.nome.trim()) {
      novosErros.nome = "Informe o nome da categoria.";
    }
    if (categoria.valorLocacao <= 0) {
      novosErros.valorLocacao = "Informe um valor de diária maior que zero.";
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
        await categoriaService.atualizar(id, categoria);
      } else {
        await categoriaService.criar(categoria);
      }
      navigate("/categorias");
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar a categoria." });
    }
  }

  return (
    <>
      <h2 className="mb-3">{id ? "Editar categoria" : "Nova categoria"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input label="Nome" name="nome" value={categoria.nome} onChange={handleChange} error={erros.nome} />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Valor da diária (R$)"
              name="valorLocacao"
              type="number"
              step="0.01"
              value={categoria.valorLocacao}
              onChange={handleChange}
              error={erros.valorLocacao}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/categorias")} />
        </div>
      </form>
    </>
  );
}
