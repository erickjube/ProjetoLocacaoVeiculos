import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import {
  formaPagamentoLabel,
  pagamentoInicial,
  statusPagamentoLabel,
  type FormaPagamento,
  type Pagamento,
  type StatusPagamento,
} from "../../models/Pagamento";
import { pagamentoService } from "../../service/pagamentoService";

type Erros = Partial<Record<keyof Pagamento, string>>;

export function PagamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pagamento, setPagamento] = useState<Pagamento>({ ...pagamentoInicial, locacaoId: id ?? "" });
  const [erros, setErros] = useState<Erros>({});
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = event.target;
    setPagamento({ ...pagamento, [name]: type === "number" ? Number(value) : value });
  }

  function handleFormaChange(event: ChangeEvent<HTMLSelectElement>) {
    setPagamento({ ...pagamento, forma: event.target.value as FormaPagamento });
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setPagamento({ ...pagamento, status: event.target.value as StatusPagamento });
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!pagamento.data) {
      novosErros.data = "Informe a data do pagamento.";
    }
    if (pagamento.valor <= 0) {
      novosErros.valor = "Informe um valor maior que zero.";
    }
    if (!pagamento.forma) {
      novosErros.forma = "Selecione a forma de pagamento.";
    }
    if (!pagamento.status) {
      novosErros.status = "Selecione o status.";
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
      await pagamentoService.criar(pagamento);
      navigate(`/locacoes/${id}`);
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível registrar o pagamento." });
    }
  }

  return (
    <>
      <h2 className="mb-3">Registrar pagamento</h2>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6">
            <Input
              label="Data"
              name="data"
              type="datetime-local"
              value={pagamento.data}
              onChange={handleChange}
              error={erros.data}
            />
          </div>
          <div className="col-12 col-md-6">
            <Input
              label="Valor (R$)"
              name="valor"
              type="number"
              step="0.01"
              value={pagamento.valor}
              onChange={handleChange}
              error={erros.valor}
            />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Forma de pagamento"
              name="forma"
              value={pagamento.forma}
              options={Object.entries(formaPagamentoLabel).map(([value, label]) => ({ value, label }))}
              onChange={handleFormaChange}
              error={erros.forma}
            />
          </div>
          <div className="col-12 col-md-6">
            <Select
              label="Status"
              name="status"
              value={pagamento.status}
              options={Object.entries(statusPagamentoLabel).map(([value, label]) => ({ value, label }))}
              onChange={handleStatusChange}
              error={erros.status}
            />
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button label="Salvar" type="submit" variant="success" />
          <Button label="Voltar" variant="secondary" onClick={() => navigate(`/locacoes/${id}`)} />
        </div>
      </form>
    </>
  );
}
