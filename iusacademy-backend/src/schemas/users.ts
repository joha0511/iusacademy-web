import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'DOCENTE', 'ESTUDIANTE']);

const firstName = z.string().trim().min(1, 'Nombre requerido');
const lastName  = z.string().trim().min(1, 'Apellido requerido');
const username  = z
  .string()
  .trim()
  .min(3, 'Usuario mínimo 3 caracteres')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números y . _ -');
const email     = z.string().trim().email('Email inválido');
const password  = z.string().min(6, 'Password mínimo 6 caracteres');

/* Listado con búsqueda/paginación*/
export const listUsersSchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListUsersInput = z.infer<typeof listUsersSchema>;

/*Crear usuario*/
export const createUserSchema = z.object({
  firstName,
  lastName,
  username,
  email,
  password,                              
  role: RoleEnum.default('ESTUDIANTE'),  
});
export type CreateUserInput = z.infer<typeof createUserSchema>;


export const updateUserSchema = z
  .object({
    id: z.string().min(1, 'ID requerido'),
    firstName: firstName.optional(),
    lastName:  lastName.optional(),
    username:  username.optional(),
    email:     email.optional(),
    role:      RoleEnum.optional(),
    password:  password.optional(), 
  })
  .refine(
    (d) =>
      d.firstName !== undefined ||
      d.lastName  !== undefined ||
      d.username  !== undefined ||
      d.email     !== undefined ||
      d.role      !== undefined ||
      d.password  !== undefined,
    { message: 'Debe enviar al menos un campo para actualizar', path: ['_'] }
  );
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
