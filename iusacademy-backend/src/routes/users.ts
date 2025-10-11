// src/routes/users.ts
import { Router, type Request, type Response } from 'express';
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  listUsersSchema,
  updateUserSchema,
  createUserSchema, 
} from '../schemas/users';

export const usersRouter = Router();

/* GET /api/users*/
usersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, page, pageSize } = listUsersSchema.parse(req.query);

    const where: Prisma.UserWhereInput | undefined = q
      ? {
          OR: [
            { firstName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { lastName:  { contains: q, mode: Prisma.QueryMode.insensitive } },
            { email:     { contains: q, mode: Prisma.QueryMode.insensitive } },
            { username:  { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({ items, total, page, pageSize });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: 'Parámetros inválidos' });
  }
});

/*Crear usuario*/
usersRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);

    const [byEmail, byUser] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.user.findUnique({ where: { username: data.username } }),
    ]);
    if (byEmail) { res.status(409).json({ error: 'El email ya está en uso' }); return; }
    if (byUser)  { res.status(409).json({ error: 'El usuario ya está en uso' }); return; }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName:  data.lastName,
        username:  data.username,
        email:     data.email,
        role:      data.role ?? 'user',
        passwordHash,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'Datos inválidos', details: err.flatten?.() });
      return;
    }
    if (err?.code === 'P2002') { 
      res.status(409).json({ error: 'Dato duplicado único' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

/*Actualizar usuario*/
usersRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateUserSchema.parse({ ...req.body, id: req.params.id });

    const dataToUpdate: Prisma.UserUpdateInput = {
      firstName: parsed.firstName,
      lastName:  parsed.lastName,
      username:  parsed.username,
      email:     parsed.email,
      role:      parsed.role,
    };

    if (parsed.password) {
      (dataToUpdate as any).passwordHash = await bcrypt.hash(parsed.password, 10);
    }

    if (parsed.email) {
      const u = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (u && u.id !== parsed.id) { res.status(409).json({ error: 'El email ya está en uso' }); return; }
    }
    if (parsed.username) {
      const u = await prisma.user.findUnique({ where: { username: parsed.username } });
      if (u && u.id !== parsed.id) { res.status(409).json({ error: 'El usuario ya está en uso' }); return; }
    }

    const updated = await prisma.user.update({
      where: { id: parsed.id },
      data: dataToUpdate,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updated);
  } catch (err: any) {
    if (err?.name === 'ZodError') { res.status(400).json({ error: 'Datos inválidos' }); return; }
    if (err?.code === 'P2025') { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    if (err?.code === 'P2002') { res.status(409).json({ error: 'Dato duplicado único' }); return; }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

/* Eliminar usuario*/
usersRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    if (err?.code === 'P2025') { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default usersRouter;
