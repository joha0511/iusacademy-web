import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";

export default function Home() {
  return (
    <main className="home">
      {/* Dibujo al fondo */}
      <div
        className="home__bg"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Overlay */}
      <div className="home__overlay" />

      {/* Contenido principal */}
      <section className="home__content">
        <div className="home__text">
          <h1 className="home__title">
            iusAcademy <br />
            <span className="accent smaller">simulador judicial</span>
          </h1>

          <p className="home__desc">
            Aprende derecho procesal practicando en un entorno realista, moderno y dinámico.
            Desarrolla tus habilidades jurídicas con simulaciones interactivas diseñadas
            para estudiantes y profesionales.
          </p>

          <div className="home__buttons">
            <Link to="/login" className="btn btn--primary">Login</Link>
            <Link to="/tramites" className="btn btn--secondary">Tramites</Link>
          </div>
        </div>
      </section>

      {/* ===================== ESTILOS ===================== */}
      <style>
        {`
          :root {
            --color-bg: #FFF8F5;
            --color-text: #1E1E1E;
            --color-subtext: #6B6B6B;
            --color-primary: #FF8A4C;
            --color-primary-soft: #FFE3D3;
            --color-accent: #E36C2D;
          }

          .home {
            position: relative;
            min-height: 100vh;
            background: var(--color-bg);
            overflow: hidden;
          }

          .home__bg {
            position: absolute;
            inset: 0;
            background-repeat: no-repeat;
            background-position: 100% center;
            background-size: 80%;
            opacity: 0.9;
            pointer-events: none;
          }

          .home__overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg,
              var(--color-bg) 0%,
              rgba(255, 248, 245, 0.95) 40%,
              rgba(255, 248, 245, 0.85) 60%,
              rgba(255, 248, 245, 0.00) 100%
            );
          }

          .home__content {
            position: relative;
            z-index: 1;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 0 2rem;
          }

          @media (min-width: 768px) {
            .home__content { padding: 0 4rem; }
          }

          @media (min-width: 1024px) {
            .home__content { padding: 0 6rem; }
          }

          .home__text {
            max-width: 32rem; /* 👈 antes 48rem, ahora más compacto */
            text-align: left;
          }

          .home__title {
            color: var(--color-text);
            font-weight: 800;
            line-height: 1.1;
            font-size: 2.6rem; /* ligeramente más pequeño */
          }

          @media (min-width: 768px) {
            .home__title { font-size: 3.2rem; }
          }

          .accent {
            color: var(--color-primary);
          }

          .smaller {
            display: inline-block;
            font-size: 1.8rem;
            font-weight: 700;
          }

          @media (min-width: 768px) {
            .smaller { font-size: 2rem; }
          }

          .home__desc {
            margin-top: 1rem;
            color: var(--color-subtext);
            font-size: 1.05rem;
            max-width: 30rem; /* 👈 reduce ancho del párrafo */
          }

          .home__buttons {
            margin-top: 2rem;
            display: flex;
            gap: 1rem;
            flex-direction: column;
          }

          @media (min-width: 640px) {
            .home__buttons { flex-direction: row; }
          }

          .btn {
            font-weight: 600;
            padding: 0.75rem 2rem;
            border-radius: 0.75rem;
            transition: all 0.2s ease;
            display: inline-block;
            text-align: center;
          }

          .btn--primary {
            color: #fff;
            background: var(--color-primary);
            box-shadow: 0 10px 20px rgba(0,0,0,0.08);
          }

          .btn--primary:hover {
            background: var(--color-accent);
          }

          .btn--secondary {
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
            background: transparent;
          }

          .btn--secondary:hover {
            background: var(--color-primary-soft);
          }

          @media (max-width: 1280px) {
            .home__bg { background-size: 40%; }
          }

          @media (max-width: 1024px) {
            .home__bg { background-size: 48%; }
          }

          @media (max-width: 768px) {
            .home__bg {
              background-size: 58%;
              background-position: 100% 30%;
              opacity: 0.35;
            }
          }

          @media (max-width: 480px) {
            .home__bg {
              background-size: 70%;
              background-position: 100% 20%;
              opacity: 0.25;
            }
          }
        `}
      </style>
    </main>
  );
}
