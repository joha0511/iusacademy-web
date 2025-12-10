// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// Fijar TZ (en Linux/WSL y muchos entornos respeta esto)
// En Windows puede que lo ignore, pero no hace daño.
process.env.TZ = process.env.TZ || "America/La_Paz";

// Rutas
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import dashboardAdminRoutes from "./routes/dashboard.admin";

const app = express();

const PORT = process.env.PORT || 4001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Endpoints API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/dashboard/admin", dashboardAdminRoutes);

// Endpoint simple para probar que está vivo
app.get("/", (_req, res) => {
  res.send("iusAcademy WEB API OK");
});

app.listen(PORT, () => {
  console.log(
    `🚀 Backend WEB iusAcademy → http://localhost:${PORT} (TZ=${process.env.TZ})`
  );
});
