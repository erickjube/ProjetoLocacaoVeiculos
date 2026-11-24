import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, type AlertProps } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Modal } from "../../components/Modal";
import { Table, type Column } from "../../components/Table";
import type { Categoria } from "../../models/Categoria";
import type { Cliente } from "../../models/Cliente";
import type { Contrato } from "../../models/Contrato";
import { calcularNumeroDiarias, corStatusLocacao, statusLocacaoLabel, type Locacao } from "../../models/Locacao";
import type { Marca } from "../../models/Marca";
import type { Modelo } from "../../models/Modelo";
import type { NotaFiscal } from "../../models/NotaFiscal";
import { formaPagamentoLabel, statusPagamentoLabel, type Pagamento } from "../../models/Pagamento";
import type { Veiculo } from "../../models/Veiculo";
import { tipoVistoriaLabel, type Vistoria } from "../../models/Vistoria";
import { categoriaService } from "../../service/categoriaService";
import { clienteService } from "../../service/clienteService";
import { contratoService } from "../../service/contratoService";
import { locacaoService } from "../../service/locacaoService";
import { marcaService } from "../../service/marcaService";
import { modeloService } from "../../service/modeloService";
import { notaFiscalService } from "../../service/notaFiscalService";
import { pagamentoService } from "../../service/pagamentoService";
import { veiculoService } from "../../service/veiculoService";
import { vistoriaService } from "../../service/vistoriaService";

interface DetalheLocacao {
  locacao: Locacao;
  cliente: Cliente;
  veiculo: Veiculo;
  modelo: Modelo;
  marca: Marca;
  categoria: Categoria;
  contrato?: Contrato;
  vistorias: Vistoria[];
  pagamentos: Pagamento[];
  notaFiscal?: NotaFiscal;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataHora(data?: string): string {
  return data ? new Date(data).toLocaleString("pt-BR") : "-";
}

function formatarData(data?: string): string {
  return data ? new Date(`${data}T00:00`).toLocaleDateString("pt-BR") : "-";
}

export function LocacaoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detalhe, setDetalhe] = useState<DetalheLocacao | null>(null);
  const [mostrarCancelamento, setMostrarCancelamento] = useState(false);
  const [alerta, setAlerta] = useState<AlertProps | null>(null);

  async function carregar() {
    if (!id) {
      return;
    }
    try {
      const locacao = await locacaoService.buscarPorId(id);
      const [cliente, veiculo, contrato, vistorias, pagamentos, notaFiscal] = await Promise.all([
        clienteService.buscarPorId(locacao.clienteId),
        veiculoService.buscarPorId(locacao.veiculoId),
        contratoService.buscarPorLocacao(id),
        vistoriaService.listarPorLocacao(id),
        pagamentoService.listarPorLocacao(id),
        notaFiscalService.buscarPorLocacao(id),
      ]);
      const modelo = await modeloService.buscarPorId(veiculo.modeloId);
      const [marca, categoria] = await Promise.all([
        marcaService.buscarPorId(modelo.marcaId),
        categoriaService.buscarPorId(modelo.categoriaId),
      ]);
      setDetalhe({ locacao, cliente, veiculo, modelo, marca, categoria, contrato, vistorias, pagamentos, notaFiscal });
    } catch {
      setAlerta({ type: "danger", message: "Não foi possível carregar os detalhes da locação." });
    }
  }

  useEffect(() => {
    carregar();
  }, [id]);

  async function confirmarCancelamento() {
    setMostrarCancelamento(false);
    if (!id || !detalhe) {
      return;
    }
    await locacaoService.atualizar(id, { ...detalhe.locacao, status: "CANCELADA" });
    setAlerta({ type: "success", message: "Locação cancelada com sucesso." });
    carregar();
  }

  if (!detalhe) {
    return alerta ? <Alert type={alerta.type} message={alerta.message} /> : <p>Carregando...</p>;
  }

  const { locacao, cliente, veiculo, modelo, marca, categoria, contrato, vistorias, pagamentos, notaFiscal } = detalhe;
  const totalPago = pagamentos.filter((p) => p.status === "PAGO").reduce((total, p) => total + p.valor, 0);

  const colunasVistorias: Column<Vistoria>[] = [
    { header: "Tipo", render: (vistoria) => tipoVistoriaLabel[vistoria.tipo] },
    { header: "Data", render: (vistoria) => formatarDataHora(vistoria.data) },
    { header: "Km", render: (vistoria) => vistoria.km.toLocaleString("pt-BR") },
    { header: "Combustível", render: (vistoria) => vistoria.nivelCombustivel },
    { header: "Observações", render: (vistoria) => vistoria.observacoes || "-" },
  ];

  const colunasPagamentos: Column<Pagamento>[] = [
    { header: "Data", render: (pagamento) => formatarDataHora(pagamento.data) },
    { header: "Valor", render: (pagamento) => formatarMoeda(pagamento.valor) },
    { header: "Forma", render: (pagamento) => formaPagamentoLabel[pagamento.forma] },
    { header: "Status", render: (pagamento) => statusPagamentoLabel[pagamento.status] },
  ];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="mb-0">
          Locação{" "}
          <span className={`badge fs-6 align-middle text-bg-${corStatusLocacao[locacao.status]}`}>
            {statusLocacaoLabel[locacao.status]}
          </span>
        </h2>
        <div className="d-flex flex-wrap gap-2">
          {locacao.status === "ABERTA" && (
            <>
              <Button
                label="Registrar devolução"
                variant="success"
                onClick={() => navigate(`/locacoes/${id}/devolucao`)}
              />
              <Button label="Cancelar locação" variant="danger" onClick={() => setMostrarCancelamento(true)} />
            </>
          )}
          <Button label="Voltar" variant="secondary" onClick={() => navigate("/locacoes")} />
        </div>
      </div>
      {alerta && <Alert type={alerta.type} message={alerta.message} />}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <Card title="Locação">
            <p className="mb-1">
              <strong>Retirada:</strong> {formatarDataHora(locacao.dataRetirada)}
            </p>
            <p className="mb-1">
              <strong>Devolução prevista:</strong> {formatarDataHora(locacao.dataDevolucaoPrevista)}
            </p>
            <p className="mb-1">
              <strong>Devolução real:</strong> {formatarDataHora(locacao.dataDevolucaoReal)}
            </p>
            <p className="mb-1">
              <strong>Km retirada:</strong> {locacao.kmRetirada.toLocaleString("pt-BR")}
            </p>
            <p className="mb-1">
              <strong>Km devolução:</strong> {locacao.kmDevolucao?.toLocaleString("pt-BR") ?? "-"}
            </p>
            <p className="mb-1">
              <strong>Diárias:</strong>{" "}
              {calcularNumeroDiarias(locacao.dataRetirada, locacao.dataDevolucaoReal ?? locacao.dataDevolucaoPrevista)}{" "}
              x {formatarMoeda(categoria.valorLocacao)}
            </p>
            <p className="mb-0">
              <strong>Valor total:</strong> {formatarMoeda(locacao.valorTotal)}
            </p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Cliente">
            <p className="mb-1">
              <strong>Nome:</strong> {cliente.nome}
            </p>
            <p className="mb-1">
              <strong>CPF:</strong> {cliente.cpf}
            </p>
            <p className="mb-1">
              <strong>CNH:</strong> {cliente.cnh} (validade {formatarData(cliente.validadeCnh)})
            </p>
            <p className="mb-1">
              <strong>Telefone:</strong> {cliente.telefone}
            </p>
            <p className="mb-1">
              <strong>E-mail:</strong> {cliente.email}
            </p>
            <p className="mb-0">
              <strong>Endereço:</strong> {cliente.endereco}
            </p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Veículo">
            <p className="mb-1">
              <strong>Placa:</strong> {veiculo.placa}
            </p>
            <p className="mb-1">
              <strong>Modelo:</strong> {marca.nome} {modelo.nome} ({modelo.ano})
            </p>
            <p className="mb-1">
              <strong>Categoria:</strong> {categoria.nome}
            </p>
            <p className="mb-1">
              <strong>Cor:</strong> {veiculo.cor}
            </p>
            <p className="mb-1">
              <strong>Chassi:</strong> {veiculo.chassi}
            </p>
            <p className="mb-0">
              <strong>Km atual:</strong> {veiculo.kmRodado.toLocaleString("pt-BR")}
            </p>
          </Card>
        </div>
        <div className="col-12 col-lg-6">
          <Card title="Contrato">
            {contrato ? (
              <>
                <p className="mb-1">
                  <strong>Número:</strong> {contrato.numero}
                </p>
                <p className="mb-1">
                  <strong>Data de emissão:</strong> {formatarData(contrato.dataEmissao)}
                </p>
                <p className="mb-0">
                  <strong>Termos:</strong> {contrato.termos}
                </p>
              </>
            ) : (
              <p className="mb-0">Nenhum contrato encontrado.</p>
            )}
          </Card>
        </div>
        <div className="col-12">
          <Card title="Vistorias">
            <Table columns={colunasVistorias} data={vistorias} />
          </Card>
        </div>
        <div className="col-12">
          <Card title="Pagamentos">
            <Table columns={colunasPagamentos} data={pagamentos} />
            <p className="mb-0">
              <strong>Total pago:</strong> {formatarMoeda(totalPago)} de {formatarMoeda(locacao.valorTotal)}
            </p>
          </Card>
        </div>
        <div className="col-12">
          <Card title="Nota fiscal">
            {notaFiscal ? (
              <>
                <p className="mb-1">
                  <strong>Número:</strong> {notaFiscal.numero}
                </p>
                <p className="mb-1">
                  <strong>Série:</strong> {notaFiscal.serie}
                </p>
                <p className="mb-1">
                  <strong>Data de emissão:</strong> {formatarData(notaFiscal.dataEmissao)}
                </p>
                <p className="mb-0">
                  <strong>Valor:</strong> {formatarMoeda(notaFiscal.valor)}
                </p>
              </>
            ) : (
              <p className="mb-0">Nenhuma nota fiscal emitida.</p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        show={mostrarCancelamento}
        title="Cancelar locação"
        message="Deseja realmente cancelar esta locação?"
        onClose={() => setMostrarCancelamento(false)}
        onConfirm={confirmarCancelamento}
      />
    </>
  );
}
