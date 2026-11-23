import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { MarcaList } from "./pages/marcas/MarcaList";
import { MarcaForm } from "./pages/marcas/MarcaForm";
import { CategoriaList } from "./pages/categorias/CategoriaList";
import { CategoriaForm } from "./pages/categorias/CategoriaForm";
import { ModeloList } from "./pages/modelos/ModeloList";
import { ModeloForm } from "./pages/modelos/ModeloForm";
import { VeiculoList } from "./pages/veiculos/VeiculoList";
import { VeiculoForm } from "./pages/veiculos/VeiculoForm";
import { ManutencaoList } from "./pages/manutencoes/ManutencaoList";
import { ManutencaoForm } from "./pages/manutencoes/ManutencaoForm";
import { ClienteList } from "./pages/clientes/ClienteList";
import { ClienteForm } from "./pages/clientes/ClienteForm";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marcas" element={<MarcaList />} />
          <Route path="/marcas/novo" element={<MarcaForm />} />
          <Route path="/marcas/:id" element={<MarcaForm />} />
          <Route path="/categorias" element={<CategoriaList />} />
          <Route path="/categorias/novo" element={<CategoriaForm />} />
          <Route path="/categorias/:id" element={<CategoriaForm />} />
          <Route path="/modelos" element={<ModeloList />} />
          <Route path="/modelos/novo" element={<ModeloForm />} />
          <Route path="/modelos/:id" element={<ModeloForm />} />
          <Route path="/veiculos" element={<VeiculoList />} />
          <Route path="/veiculos/novo" element={<VeiculoForm />} />
          <Route path="/veiculos/:id" element={<VeiculoForm />} />
          <Route path="/manutencoes" element={<ManutencaoList />} />
          <Route path="/manutencoes/novo" element={<ManutencaoForm />} />
          <Route path="/manutencoes/:id" element={<ManutencaoForm />} />
          <Route path="/clientes" element={<ClienteList />} />
          <Route path="/clientes/novo" element={<ClienteForm />} />
          <Route path="/clientes/:id" element={<ClienteForm />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
