import { api } from "./api";
import type { Veiculo } from "../models/Veiculo";

export const veiculoService = {
  listar: async (): Promise<Veiculo[]> => (await api.get<Veiculo[]>("/veiculos")).data,
  buscarPorId: async (id: string): Promise<Veiculo> => (await api.get<Veiculo>(`/veiculos/${id}`)).data,
  criar: async (veiculo: Veiculo): Promise<Veiculo> => (await api.post<Veiculo>("/veiculos", veiculo)).data,
  atualizar: async (id: string, veiculo: Veiculo): Promise<Veiculo> => (await api.put<Veiculo>(`/veiculos/${id}`, veiculo)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/veiculos/${id}`);
  },
  listarPorModelo: async (modeloId: string): Promise<Veiculo[]> =>
    (await api.get<Veiculo[]>("/veiculos")).data.filter((item) => item.modeloId === modeloId),
};
