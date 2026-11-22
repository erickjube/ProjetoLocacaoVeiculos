import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

interface NavbarItem {
  path: string;
  label: string;
}

const itens: NavbarItem[] = [
  { path: "/marcas", label: "Marcas" },
  { path: "/categorias", label: "Categorias" },
  { path: "/modelos", label: "Modelos" },
  { path: "/veiculos", label: "Veículos" },
  { path: "/manutencoes", label: "Manutenções" },
  { path: "/clientes", label: "Clientes" },
  { path: "/locacoes", label: "Locações" },
];

export function Navbar() {
  const [aberto, setAberto] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={() => setAberto(false)}>
          Locadora de Veículos
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={aberto}
          onClick={() => setAberto(!aberto)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${aberto ? " show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {itens.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink className="nav-link" to={item.path} onClick={() => setAberto(false)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
