import type { Locacao } from "./Locacao";
import type { Manutencao } from "./Manutencao";

export type StatusVeiculo = "DISPONIVEL" | "LOCADO" | "EM_MANUTENCAO";

export interface Veiculo {
  id?: string;
  chassi: string;
  placa: string;
  anoFabricacao: number;
  cor: string;
  kmRodado: number;
  modeloId: string;
}

export const veiculoInicial: Veiculo = {
  chassi: "",
  placa: "",
  anoFabricacao: new Date().getFullYear(),
  cor: "",
  kmRodado: 0,
  modeloId: "",
};

export const statusVeiculoLabel: Record<StatusVeiculo, string> = {
  DISPONIVEL: "Disponível",
  LOCADO: "Locado",
  EM_MANUTENCAO: "Em manutenção",
};

export function calcularStatusVeiculo(
  veiculo: Veiculo,
  locacoes: Locacao[],
  manutencoes: Manutencao[],
): StatusVeiculo {
  const hoje = new Date().toLocaleDateString("en-CA");
  if (locacoes.some((l) => l.veiculoId === veiculo.id && l.status === "ABERTA")) {
    return "LOCADO";
  }
  if (manutencoes.some((m) => m.veiculoId === veiculo.id && m.data === hoje)) {
    return "EM_MANUTENCAO";
  }
  return "DISPONIVEL";
}
