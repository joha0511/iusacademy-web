import { NavLink } from "react-router-dom";

export default function SidebarLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `s-link ${isActive ? "s-active" : ""}`
      }
    >
      {children}
      <style>{`
        .s-link{
          display:block; padding:.65rem .9rem; border-radius:.6rem;
          color:#6B6B6B; font-weight:600; text-decoration:none;
        }
        .s-link:hover{ background:#FFE3D3; color:#1E1E1E; }
        .s-active{ background:#FF8A4C; color:#fff; }
      `}</style>
    </NavLink>
  );
}
