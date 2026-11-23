import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import { cnhVencida, type Cliente } from "../../models/Cliente";
import { clienteService } from "../../service/clienteService";
import { locacaoService } from "../../service/locacaoService";

export function ClienteList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteExcluir, setClienteExcluir] = useState<Cliente | null>(null);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    try {
      setClientes(await clienteService.listar());
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar os clientes." });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmarExclusao() {
    if (!clienteExcluir?.id) {
      return;
    }
    const { id, nome } = clienteExcluir;
    setClienteExcluir(null);
    const locacoes = await locacaoService.listarPorCliente(id);
    if (locacoes.length > 0) {
      setAlerta({
        type: "danger",
        message: `O cliente ${nome} possui ${locacoes.length} locação(ões) vinculada(s) e não pode ser excluído.`,
      });
      return;
    }
    await clienteService.excluir(id);
    setAlerta({ type: "success", message: "Cliente excluído com sucesso." });
    carregar();
  }

  const columns: Column<Cliente>[] = [
    { header: "Nome", render: (cliente) => cliente.nome },
    { header: "CPF", render: (cliente) => cliente.cpf },
    { header: "CNH", render: (cliente) => cliente.cnh },
    {
      header: "Validade CNH",
      render: (cliente) => (
        <span className={cnhVencida(cliente) ? "text-danger fw-semibold" : ""}>
          {new Date(`${cliente.validadeCnh}T00:00`).toLocaleDateString("pt-BR")}
          {cnhVencida(cliente) && " (vencida)"}
        </span>
      ),
    },
    { header: "Telefone", render: (cliente) => cliente.telefone },
    { header: "E-mail", render: (cliente) => cliente.email },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">Clientes</h2>
        <Button label="Novo cliente" onClick={() => navigate("/clientes/novo")} />
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}
      <Table
        columns={columns}
        data={clientes}
        onEdit={(cliente) => navigate(`/clientes/${cliente.id}`)}
        onDelete={setClienteExcluir}
      />
      <Modal
        show={clienteExcluir !== null}
        title="Excluir cliente"
        message={`Deseja realmente excluir o cliente ${clienteExcluir?.nome}?`}
        onClose={() => setClienteExcluir(null)}
        onConfirm={confirmarExclusao}
      />
    </>
  );
}
