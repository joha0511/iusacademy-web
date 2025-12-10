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

//Docente
import DocenteLayout from "./layouts/docente/DocenteLayout";
import DocenteHome from "./pages/docente/DocenteHome";

// Admin
import AdminLayout from "./layouts/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminCrearUsuario from "./pages/admin/AdminCrearUsuario";
import AdminCrearProceso from "./pages/admin/AdminCrearProceso";
import AdminPerfil from "./pages/admin/AdminPerfil";
import AdminAjustes from "./pages/admin/AdminAjustes";

//Estudiante
import EstudianteLayout from "./layouts/estudiante/EstudianteLayout";
import EstudianteHome from "./pages/estudiante/EstudianteHome";
import EstudianteTareas from "./pages/estudiante/EstudianteTareas";
import EstudianteSimulacion from "./pages/estudiante/EstudianteSimulacion";
import EstudianteCalendario from "./pages/estudiante/EstudianteCalendario";
import EstudiantePerfil from "./pages/estudiante/EstudiantePerfil";
import EstudianteRevisor from "./pages/estudiante/EstudianRevisor";
import EstudianteQuizIA from "./pages/estudiante/EstudianteQuizz";
import EstudianteAsistente from "./pages/estudiante/EstudianteAsistente";
import EstudianteDetectorIA from "./pages/estudiante/EstudianteDetectorIA";
import EstudianteTutor from "./pages/estudiante/EstudianteTutor";
import EstudianteContratos from "./pages/estudiante/EstudianteContratos";

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

        {/* Rutas de Estudiante con sidebar vertical */}
        <Route path="/estudiante" element={<EstudianteLayout />}>
          <Route index element={<EstudianteHome />} />
          <Route path="tareas" element={<EstudianteTareas />} />
          <Route path="simulacion" element={<EstudianteSimulacion />} />
          <Route path="calendario" element={<EstudianteCalendario />} />
          <Route path="perfil" element={<EstudiantePerfil />} />
          <Route path="ia/revisor" element={<EstudianteRevisor />} />
          <Route path="ia/quiz" element={<EstudianteQuizIA />} />
          <Route path="ia/asistente" element={<EstudianteAsistente />} />
          <Route path="ia/detector" element={<EstudianteDetectorIA />} />
          <Route path="ia/tutorias" element={<EstudianteTutor />} />
          <Route path="ia/contratos" element={<EstudianteContratos />} />
          
        </Route>

        <Route path="/docente" element={<DocenteLayout />}>
          <Route index element={<DocenteHome />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{padding:24}}>Página no encontrada</div>} />
      </Routes>
    </div>
  );
}
