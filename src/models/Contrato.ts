export interface Contrato {
  id?: string;
  numero: string;
  dataEmissao: string;
  termos: string;
  locacaoId: string;
}

export const contratoInicial: Contrato = {
  numero: "",
  dataEmissao: "",
  termos: "",
  locacaoId: "",
};

export const termosPadraoContrato =
  "O locatário se compromete a devolver o veículo na data prevista e nas mesmas condições em que o recebeu, " +
  "respondendo por danos, multas e despesas ocorridas durante o período da locação.";

export function gerarNumeroContrato(quantidadeExistente: number): string {
  const ano = new Date().getFullYear();
  return `CTR-${ano}-${String(quantidadeExistente + 1).padStart(4, "0")}`;
}
