// src/routes/users.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { sendAccessEmail } from "../email";
import {
  TEMP_PASSWORD_TTL_DAYS,
  isUnifranzEmail,
  generarPasswordTemporal,
  materiaToEnum,
} from "../utils";
import { Rol } from "@prisma/client";

const router = Router();

/* ======================================================
   GET /api/usuarios
   ====================================================== */
router.get("/", async (_req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

/* ======================================================
   GET /api/usuarios/:id
   ====================================================== */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json(usuario);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    return res.status(500).json({ message: "Error al obtener usuario" });
  }
});

/* ======================================================
   POST /api/usuarios → crear (sin enviar acceso aún)
   ====================================================== */
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      correo,
      password, // opcional
      telefono,
      rol,
      materia,
    } = req.body;

    if (!nombre || !apellidos || !correo) {
      return res.status(400).json({
        message:
          "Nombre, apellidos y correo institucional son obligatorios.",
      });
    }

    if (!isUnifranzEmail(correo)) {
      return res.status(400).json({
        message: "El correo debe ser institucional (@unifranz.edu.bo).",
      });
    }

    const rolDb: Rol =
      ((rol?.toUpperCase().trim() as Rol) || Rol.ESTUDIANTE);

    const materiaDb =
      rol === "admin"
        ? null
        : materiaToEnum(materia) || "DERECHO_PROCESAL_CIVIL";

    const plainPassword =
      (password && password.trim()) || generarPasswordTemporal(8);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const usuario = await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        passwordHash,
        telefono: (telefono || "").trim(),
        rol: rolDb,
        materia: materiaDb as any,
      },
    });

    return res.status(201).json(usuario);
  } catch (err: any) {
    console.error("Error al crear usuario:", err);

    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Ya existe un usuario con ese correo." });
    }

    return res.status(500).json({ message: "Error al crear usuario" });
  }
});

/* ======================================================
   PUT /api/usuarios/:id
   ====================================================== */
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const {
      nombre,
      apellidos,
      correo,
      password,
      telefono,
      rol,
      materia,
    } = req.body;

    if (!nombre || !apellidos || !correo) {
      return res.status(400).json({
        message:
          "Nombre, apellidos y correo institucional son obligatorios.",
      });
    }

    if (!isUnifranzEmail(correo)) {
      return res.status(400).json({
        message: "El correo debe ser institucional (@unifranz.edu.bo).",
      });
    }

    const rolDb: Rol =
      ((rol?.toUpperCase().trim() as Rol) || Rol.ESTUDIANTE);

    const materiaDb =
      rol === "admin"
        ? null
        : materiaToEnum(materia) || "DERECHO_PROCESAL_CIVIL";

    let dataUpdate: any = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim(),
      telefono: (telefono || "").trim(),
      rol: rolDb,
      materia: materiaDb as any,
    };

    if (password && password.trim() !== "") {
      dataUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: dataUpdate,
    });

    return res.json(usuario);
  } catch (err: any) {
    console.error("Error al actualizar usuario:", err);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

/* ======================================================
   DELETE /api/usuarios/:id
   ====================================================== */
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (err: any) {
    console.error("Error al eliminar usuario:", err);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

/* ======================================================
   POST /api/usuarios/:id/enviar-acceso
   → temp password + email (AJUSTADO TIMEZONE)
   ====================================================== */
router.post("/:id/enviar-acceso", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const usuario = await prisma.user.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const accessCount = usuario.accessEmailCount ?? 0;

    // Si ya usó su contraseña temporal, no se permite reenviar
    if (accessCount > 0 && usuario.mustChangePassword === false) {
      return res.status(400).json({
        message:
          "Este usuario ya cambió su contraseña temporal. " +
          "Si necesita ayuda, realiza un reseteo manual de contraseña.",
      });
    }

    const now = new Date();
    const expiresAt = usuario.tempPasswordExpiresAt
      ? new Date(usuario.tempPasswordExpiresAt)
      : null;

    // Si ya tiene una temporal vigente, no permitir nuevo envío
    if (usuario.mustChangePassword && expiresAt && expiresAt > now) {
      const msLeft = expiresAt.getTime() - now.getTime();
      const hoursLeft = Math.round(msLeft / (1000 * 60 * 60));

      return res.status(400).json({
        message:
          `Este usuario ya tiene una contraseña temporal activa. ` +
          `Podrás reenviar el acceso cuando expire (en aprox. ${hoursLeft} h).`,
      });
    }

    // 🔐 8 caracteres, igual que el backend móvil
    const passwordTemporal = generarPasswordTemporal(8);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    // ⚠️ AQUÍ ESTABA EL PROBLEMA ANTES
    // Ahora dejamos que PostgreSQL ponga la hora local (America/La_Paz)
    await prisma.$executeRawUnsafe(
      `
      UPDATE "User"
      SET "passwordHash" = $1,
          "mustChangePassword" = true,
          "accessEmailCount" = "accessEmailCount" + 1,
          "lastAccessEmailAt" = NOW(),
          "tempPasswordExpiresAt" = NOW() + $2 * INTERVAL '1 day'
      WHERE id = $3
      `,
      passwordHash,
      TEMP_PASSWORD_TTL_DAYS,
      id
    );

    const appWebUrl = process.env.APP_URL || "http://localhost:5173";
    const appMobileUrl = process.env.APP_MOBILE_URL;
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidos ?? ""}`.trim();

    await sendAccessEmail(
      usuario.correo,
      nombreCompleto,
      passwordTemporal,
      appWebUrl,
      appMobileUrl,
      TEMP_PASSWORD_TTL_DAYS
    );

    return res.json({
      message:
        "Acceso enviado correctamente al correo institucional del usuario.",
    });
  } catch (err: any) {
    console.error("Error al enviar acceso:", err);
    return res
      .status(500)
      .json({ message: "Error al enviar acceso al usuario" });
  }
});

export default router;
