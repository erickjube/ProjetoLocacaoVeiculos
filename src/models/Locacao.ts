export type StatusLocacao = "ABERTA" | "FINALIZADA" | "CANCELADA";

export interface Locacao {
  id?: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string;
  kmRetirada: number;
  kmDevolucao?: number;
  valorTotal: number;
  status: StatusLocacao;
  clienteId: string;
  veiculoId: string;
}

export const locacaoInicial: Locacao = {
  dataRetirada: "",
  dataDevolucaoPrevista: "",
  kmRetirada: 0,
  valorTotal: 0,
  status: "ABERTA",
  clienteId: "",
  veiculoId: "",
};

export const statusLocacaoLabel: Record<StatusLocacao, string> = {
  ABERTA: "Aberta",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

export function calcularNumeroDiarias(dataInicio: string, dataFim: string): number {
  const umDia = 24 * 60 * 60 * 1000;
  const diferenca = new Date(dataFim).getTime() - new Date(dataInicio).getTime();
  return Math.max(1, Math.ceil(diferenca / umDia));
}

export function calcularValorLocacao(dataInicio: string, dataFim: string, valorDiaria: number): number {
  return calcularNumeroDiarias(dataInicio, dataFim) * valorDiaria;
}
