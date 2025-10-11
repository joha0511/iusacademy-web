// src/middleware/auth.ts
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { sub: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    (req as any).user = user;
    return next(); // <- importante terminar la función aquí
  } catch {
    res.status(401).json({ error: "Token inválido" });
    return;
  }
}
