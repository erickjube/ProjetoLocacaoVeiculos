import { api } from "./api";
import type { Manutencao } from "../models/Manutencao";

export const manutencaoService = {
  listar: async (): Promise<Manutencao[]> => (await api.get<Manutencao[]>("/manutencoes")).data,
  buscarPorId: async (id: string): Promise<Manutencao> => (await api.get<Manutencao>(`/manutencoes/${id}`)).data,
  criar: async (manutencao: Manutencao): Promise<Manutencao> => (await api.post<Manutencao>("/manutencoes", manutencao)).data,
  atualizar: async (id: string, manutencao: Manutencao): Promise<Manutencao> => (await api.put<Manutencao>(`/manutencoes/${id}`, manutencao)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/manutencoes/${id}`);
  },
  listarPorVeiculo: async (veiculoId: string): Promise<Manutencao[]> =>
    (await api.get<Manutencao[]>("/manutencoes")).data.filter((item) => item.veiculoId === veiculoId),
};
