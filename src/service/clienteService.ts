import { api } from "./api";
import type { Cliente } from "../models/Cliente";

export const clienteService = {
  listar: async (): Promise<Cliente[]> => (await api.get<Cliente[]>("/clientes")).data,
  buscarPorId: async (id: string): Promise<Cliente> => (await api.get<Cliente>(`/clientes/${id}`)).data,
  criar: async (cliente: Cliente): Promise<Cliente> => (await api.post<Cliente>("/clientes", cliente)).data,
  atualizar: async (id: string, cliente: Cliente): Promise<Cliente> => (await api.put<Cliente>(`/clientes/${id}`, cliente)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
