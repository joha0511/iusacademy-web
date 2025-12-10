// src/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

const router = Router();

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña son obligatorios." });
    }

    const usuario = await prisma.user.findUnique({
      where: { correo: correo.trim() },
    });

    if (!usuario) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    const isValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    if (usuario.mustChangePassword && usuario.tempPasswordExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(usuario.tempPasswordExpiresAt);
      if (expiresAt < now) {
        return res.status(401).json({
          message:
            "Tu contraseña temporal ha expirado. Solicita un nuevo acceso al administrador.",
        });
      }
    }

    const forceChangePassword = usuario.mustChangePassword === true;

    return res.json({
      message: "Login correcto",
      forceChangePassword,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono,
        role: usuario.rol.toLowerCase(),
        materia: usuario.materia,
        mustChangePassword: usuario.mustChangePassword,
        tempPasswordExpiresAt: usuario.tempPasswordExpiresAt,
      },
    });
  } catch (err: any) {
    console.error("Error al hacer login:", err);
    return res.status(500).json({ message: "Error al hacer login" });
  }
});

/* POST /api/auth/change-password */
router.post("/change-password", async (req, res) => {
  try {
    const { id, oldPassword, newPassword } = req.body;

    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Datos incompletos." });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isOldValid = await bcrypt.compare(
      oldPassword,
      usuario.passwordHash
    );
    if (!isOldValid) {
      return res
        .status(401)
        .json({ message: "Contraseña anterior incorrecta." });
    }

    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        passwordHash,
        mustChangePassword: false,
        tempPasswordExpiresAt: null,
      },
    });

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err: any) {
    console.error("Error al cambiar contraseña:", err);
    return res.status(500).json({ message: "Error al cambiar contraseña" });
  }
});

export default router;
