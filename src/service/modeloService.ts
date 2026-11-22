import { api } from "./api";
import type { Modelo } from "../models/Modelo";

export const modeloService = {
  listar: async (): Promise<Modelo[]> => (await api.get<Modelo[]>("/modelos")).data,
  buscarPorId: async (id: string): Promise<Modelo> => (await api.get<Modelo>(`/modelos/${id}`)).data,
  criar: async (modelo: Modelo): Promise<Modelo> => (await api.post<Modelo>("/modelos", modelo)).data,
  atualizar: async (id: string, modelo: Modelo): Promise<Modelo> => (await api.put<Modelo>(`/modelos/${id}`, modelo)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/modelos/${id}`);
  },
  listarPorMarca: async (marcaId: string): Promise<Modelo[]> =>
    (await api.get<Modelo[]>("/modelos")).data.filter((item) => item.marcaId === marcaId),
  listarPorCategoria: async (categoriaId: string): Promise<Modelo[]> =>
    (await api.get<Modelo[]>("/modelos")).data.filter((item) => item.categoriaId === categoriaId),
};
