import { api } from "./api";
import type { Marca } from "../models/Marca";

export const marcaService = {
  listar: async (): Promise<Marca[]> => (await api.get<Marca[]>("/marcas")).data,
  buscarPorId: async (id: string): Promise<Marca> => (await api.get<Marca>(`/marcas/${id}`)).data,
  criar: async (marca: Marca): Promise<Marca> => (await api.post<Marca>("/marcas", marca)).data,
  atualizar: async (id: string, marca: Marca): Promise<Marca> => (await api.put<Marca>(`/marcas/${id}`, marca)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/marcas/${id}`);
  },
};
