import { Routes, Route, Outlet } from "react-router-dom";

// Layout público con navbar
import Navbar from "./components/Navbar";
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

// Páginas públicas
import Home from "./pages/Home";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import Tramites from "./pages/Tramites";
import Login from "./pages/Login";

// Admin
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminCrearUsuario from "./pages/admin/AdminCrearUsuario";
import AdminCrearProceso from "./pages/admin/AdminCrearProceso";
import AdminPerfil from "./pages/admin/AdminPerfil";
import AdminAjustes from "./pages/admin/AdminAjustes";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Rutas públicas con navbar horizontal */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/tramites" element={<Tramites />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas de Admin con sidebar vertical */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="perfil" element={<AdminPerfil />} />
          <Route path="crear-usuario" element={<AdminCrearUsuario />} />
          <Route path="crear-proceso" element={<AdminCrearProceso />} />
          <Route path="ajustes" element={<AdminAjustes />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{padding:24}}>Página no encontrada</div>} />
      </Routes>
    </div>
  );
}
