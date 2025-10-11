import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  username: z.string().min(3, 'Usuario requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'DOCENTE', 'ESTUDIANTE']).default('DOCENTE'),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(3),
  password: z.string().min(6),
});
