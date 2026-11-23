import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { marcaInicial, type Marca } from "../../models/Marca";
import { marcaService } from "../../service/marcaService";

type Erros = Partial<Record<keyof Marca, string>>;

export function MarcaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [marca, setMarca] = useState<Marca>(marcaInicial);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    if (id) {
      marcaService.buscarPorId(id).then(setMarca);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setMarca({ ...marca, [event.target.name]: event.target.value });
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!marca.nome.trim()) {
      novosErros.nome = "Informe o nome da marca.";
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
        await marcaService.atualizar(id, marca);
      } else {
        await marcaService.criar(marca);
      }
      navigate("/marcas");
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar a marca." });
    }
  }

  return (
    <>
      <h2 className="mb-3">{id ? "Editar marca" : "Nova marca"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input label="Nome" name="nome" value={marca.nome} onChange={handleChange} error={erros.nome} />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/marcas")} />
        </div>
      </form>
    </>
  );
}
