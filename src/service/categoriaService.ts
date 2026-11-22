import { api } from "./api";
import type { Categoria } from "../models/Categoria";

export const categoriaService = {
  listar: async (): Promise<Categoria[]> => (await api.get<Categoria[]>("/categorias")).data,
  buscarPorId: async (id: string): Promise<Categoria> => (await api.get<Categoria>(`/categorias/${id}`)).data,
  criar: async (categoria: Categoria): Promise<Categoria> => (await api.post<Categoria>("/categorias", categoria)).data,
  atualizar: async (id: string, categoria: Categoria): Promise<Categoria> => (await api.put<Categoria>(`/categorias/${id}`, categoria)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};
