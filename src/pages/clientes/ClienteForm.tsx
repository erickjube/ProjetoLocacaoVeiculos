import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { clienteInicial, type Cliente } from "../../models/Cliente";
import { clienteService } from "../../service/clienteService";

type Erros = Partial<Record<keyof Cliente, string>>;

export function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente>(clienteInicial);
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  useEffect(() => {
    if (id) {
      clienteService.buscarPorId(id).then(setCliente);
    }
  }, [id]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setCliente({ ...cliente, [event.target.name]: event.target.value });
  }

  async function validar(): Promise<boolean> {
    const novosErros: Erros = {};
    if (!cliente.nome.trim()) {
      novosErros.nome = "Informe o nome.";
    }
    if (!cliente.cpf.trim()) {
      novosErros.cpf = "Informe o CPF.";
    }
    if (!cliente.cnh.trim()) {
      novosErros.cnh = "Informe a CNH.";
    }
    if (!cliente.validadeCnh) {
      novosErros.validadeCnh = "Informe a validade da CNH.";
    }
    if (!cliente.telefone.trim()) {
      novosErros.telefone = "Informe o telefone.";
    }
    if (!cliente.email.trim()) {
      novosErros.email = "Informe o e-mail.";
    }
    if (!cliente.endereco.trim()) {
      novosErros.endereco = "Informe o endereço.";
    }

    const outrosClientes = (await clienteService.listar()).filter((c) => c.id !== id);
    if (outrosClientes.some((c) => c.cpf === cliente.cpf.trim())) {
      novosErros.cpf = "Já existe um cliente cadastrado com este CPF.";
    }
    if (outrosClientes.some((c) => c.cnh === cliente.cnh.trim())) {
      novosErros.cnh = "Já existe um cliente cadastrado com esta CNH.";
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
      const dados: Cliente = { ...cliente, cpf: cliente.cpf.trim(), cnh: cliente.cnh.trim() };
      if (id) {
        await clienteService.atualizar(id, dados);
      } else {
        await clienteService.criar(dados);
      }
      navigate("/clientes");
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível salvar o cliente." });
    }
  }

  return (
    <>
      <h2 className="mb-3">{id ? "Editar cliente" : "Novo cliente"}</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input label="Nome" name="nome" value={cliente.nome} onChange={handleChange} error={erros.nome} />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="CPF"
              name="cpf"
              value={cliente.cpf}
              placeholder="000.000.000-00"
              onChange={handleChange}
              error={erros.cpf}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input label="CNH" name="cnh" value={cliente.cnh} onChange={handleChange} error={erros.cnh} />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Validade da CNH"
              name="validadeCnh"
              type="date"
              value={cliente.validadeCnh}
              onChange={handleChange}
              error={erros.validadeCnh}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Telefone"
              name="telefone"
              type="tel"
              value={cliente.telefone}
              placeholder="(00) 00000-0000"
              onChange={handleChange}
              error={erros.telefone}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={cliente.email}
              onChange={handleChange}
              error={erros.email}
            />
          </div>
          <div className="col-12">
            <Input
              label="Endereço"
              name="endereco"
              value={cliente.endereco}
              onChange={handleChange}
              error={erros.endereco}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/clientes")} />
        </div>
      </form>
    </>
  );
}
