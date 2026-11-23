import { Link } from "react-router-dom";
import { Card } from "../components/Card";

interface Atalho {
  titulo: string;
  descricao: string;
  path: string;
}

const atalhos: Atalho[] = [
  { titulo: "Frota", descricao: "Marcas, categorias, modelos e veículos.", path: "/veiculos" },
  { titulo: "Manutenções", descricao: "Histórico de manutenções de cada veículo.", path: "/manutencoes" },
  { titulo: "Clientes", descricao: "Dados pessoais e de habilitação dos clientes.", path: "/clientes" },
  { titulo: "Locações", descricao: "Retirada, devolução, pagamentos e nota fiscal.", path: "/locacoes" },
];

export function Home() {
  return (
    <>
      <h1 className="mb-2">Locadora de Veículos</h1>
      <p className="text-muted mb-4">Controle da frota, dos clientes e do ciclo completo das locações.</p>
      <div className="row g-3">
        {atalhos.map((atalho) => (
          <div className="col-12 col-md-6 col-lg-3" key={atalho.path}>
            <Card title={atalho.titulo}>
              <p>{atalho.descricao}</p>
              <Link to={atalho.path} className="btn btn-outline-primary btn-sm">
                Acessar
              </Link>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
