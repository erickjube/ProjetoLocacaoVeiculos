import { api } from "./api";
import type { Locacao } from "../models/Locacao";

export const locacaoService = {
  listar: async (): Promise<Locacao[]> => (await api.get<Locacao[]>("/locacoes")).data,
  buscarPorId: async (id: string): Promise<Locacao> => (await api.get<Locacao>(`/locacoes/${id}`)).data,
  criar: async (locacao: Locacao): Promise<Locacao> => (await api.post<Locacao>("/locacoes", locacao)).data,
  atualizar: async (id: string, locacao: Locacao): Promise<Locacao> => (await api.put<Locacao>(`/locacoes/${id}`, locacao)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/locacoes/${id}`);
  },
  listarPorCliente: async (clienteId: string): Promise<Locacao[]> =>
    (await api.get<Locacao[]>("/locacoes")).data.filter((item) => item.clienteId === clienteId),
  listarPorVeiculo: async (veiculoId: string): Promise<Locacao[]> =>
    (await api.get<Locacao[]>("/locacoes")).data.filter((item) => item.veiculoId === veiculoId),
};
