// src/app.ts
import express from "express";
import cors from "cors";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRouter);
app.use("/api/usuarios", usersRouter);

export default app;
