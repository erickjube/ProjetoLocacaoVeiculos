import { api } from "./api";
import type { NotaFiscal } from "../models/NotaFiscal";

export const notaFiscalService = {
  listar: async (): Promise<NotaFiscal[]> => (await api.get<NotaFiscal[]>("/notasFiscais")).data,
  buscarPorId: async (id: string): Promise<NotaFiscal> => (await api.get<NotaFiscal>(`/notasFiscais/${id}`)).data,
  criar: async (notaFiscal: NotaFiscal): Promise<NotaFiscal> => (await api.post<NotaFiscal>("/notasFiscais", notaFiscal)).data,
  atualizar: async (id: string, notaFiscal: NotaFiscal): Promise<NotaFiscal> => (await api.put<NotaFiscal>(`/notasFiscais/${id}`, notaFiscal)).data,
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/notasFiscais/${id}`);
  },
  buscarPorLocacao: async (locacaoId: string): Promise<NotaFiscal | undefined> =>
    (await api.get<NotaFiscal[]>("/notasFiscais")).data.find((item) => item.locacaoId === locacaoId),
};
