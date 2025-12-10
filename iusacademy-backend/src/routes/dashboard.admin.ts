// src/routes/dashboard.admin.ts
import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/dashboard/admin/resumen
router.get("/resumen", async (_req, res) => {
  try {
    const totalEstudiantes = await prisma.user.count({
      where: { rol: "ESTUDIANTE" },
    });

    const totalDocentes = await prisma.user.count({
      where: { rol: "DOCENTE" },
    });

    const totalUsuarios = await prisma.user.count();

    const materiasRaw = await prisma.user.groupBy({
      by: ["materia"],
      where: {
        rol: "ESTUDIANTE",
        materia: { not: null },
      },
      _count: { _all: true },
    });

    const materias = materiasRaw.map((row) => ({
      materia: row.materia,
      count: row._count._all,
    }));

    const totalGrupos = 6;

    return res.json({
      totalEstudiantes,
      totalDocentes,
      totalUsuarios,
      totalGrupos,
      materias,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error dashboard" });
  }
});

export default router;
