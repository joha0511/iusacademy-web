import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

const linkBase =
  "px-4 py-2 rounded-md text-sm font-medium transition";
const linkActive = "bg-primary text-white";
const linkIdle = "text-text hover:text-accent";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-primarySoft bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="text-2xl font-extrabold text-primary">
          iusAcademy
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Inicio</NavLink>
          <NavLink to="/servicios" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Servicios</NavLink>
          <NavLink to="/contacto" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Contacto</NavLink>
          <NavLink to="/tramites" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Trámites</NavLink>

          <Link to="/login" className="ml-2 rounded-lg bg-primary px-5 py-2 text-white hover:bg-accent">
            Login
          </Link>
        </div>

        {/* Mobile button */}
        <button
          className="inline-flex items-center rounded-md border border-primarySoft p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-primarySoft bg-bg">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-3">
            <NavLink onClick={() => setOpen(false)} to="/" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Inicio</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/servicios" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Servicios</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/contacto" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Contacto</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/tramites" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Trámites</NavLink>
            <Link onClick={() => setOpen(false)} to="/login" className="mt-2 rounded-lg bg-primary px-5 py-2 text-center text-white hover:bg-accent">Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
