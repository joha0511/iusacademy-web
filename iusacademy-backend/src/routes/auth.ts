// src/routes/auth.ts
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { registerSchema, loginSchema } from '../schemas/auth';
import { requireAuth } from '../middleware/auth';

export const authRouter = Router();

/** Registro */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const [byUser, byEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username: data.username } }),
      prisma.user.findUnique({ where: { email: data.email } }),
    ]);
    if (byUser) { res.status(409).json({ error: 'El usuario ya existe' }); return; }
    if (byEmail) { res.status(409).json({ error: 'El email ya existe' }); return; }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        passwordHash,
        role: data.role,
      },
      select: {
        id: true, firstName: true, lastName: true, username: true, email: true, role: true, createdAt: true, updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos', details: err.issues }); return; }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

/** Login */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    });
    if (!user) { res.status(401).json({ error: 'Credenciales inválidas' }); return; }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) { res.status(401).json({ error: 'Credenciales inválidas' }); return; }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // en prod: true con HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: 'Login OK', role: user.role });
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos' }); return; }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

/** Me */
authRouter.get('/me', requireAuth, (req: Request, res: Response): void => {
  res.json((req as any).user);
});

/** Logout */
authRouter.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ ok: true });
});
