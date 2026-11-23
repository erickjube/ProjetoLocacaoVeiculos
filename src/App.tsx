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
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
