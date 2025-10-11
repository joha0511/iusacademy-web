/// <reference types="jest" />
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/prisma';

const unique = () => Math.random().toString(36).slice(2, 8);

const expectStatus = (res: request.Response, expected: number) => {
  if (res.status !== expected) {
    console.error('Respuesta inesperada:', res.status, res.body);
  }
  expect(res.status).toBe(expected);
};

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Users API (crear, editar, eliminar)', () => {
  it('Crea un usuario (POST /api/users)', async () => {
    const email = `crear_${unique()}@iusacademy.com`;

    const res = await request(app)
      .post('/api/users')
      .send({
        firstName: 'Johanna',
        lastName:  'Claros',
        username:  `jclaros_${unique()}`,
        email,
        password:  '123456',
        role:      'ESTUDIANTE',
      });

    expectStatus(res, 201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({
      firstName: 'Johanna',
      lastName:  'Claros',
      email,
      role: 'ESTUDIANTE', 
    });
    expect(res.body).toHaveProperty('username');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('Edita un usuario (PUT /api/users/:id)', async () => {
    const email = `edit_${unique()}@iusacademy.com`;
    const username = `user_${unique()}`;

    // Crear primero
    const crear = await request(app)
      .post('/api/users')
      .send({
        firstName: 'User',
        lastName:  'Edit',
        username,
        email,
        password: '123456',
        role: 'ESTUDIANTE', 
      });

    expectStatus(crear, 201);
    const id = crear.body.id;

    // Editar
    const res = await request(app)
      .put(`/api/users/${id}`)
      .send({ firstName: 'Editado' });

    expectStatus(res, 200);
    expect(res.body).toMatchObject({
      id,
      firstName: 'Editado',
      lastName:  'Edit',
      email,
      username,
    });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('Elimina un usuario (DELETE /api/users/:id)', async () => {
    const email = `del_${unique()}@iusacademy.com`;
    const username = `deluser_${unique()}`;

    const crear = await request(app).post('/api/users').send({
      firstName: 'User',
      lastName:  'Delete',
      username,
      email,
      password: '123456',
      role: 'ESTUDIANTE', 
    });

    expectStatus(crear, 201);
    const id = crear.body.id;

    // Eliminar
    const del = await request(app).delete(`/api/users/${id}`).send();
    expect([200, 204]).toContain(del.status); // tu delete devuelve 200 {ok:true}; aceptamos 200 o 204

    // Intento de editar luego de borrar -> debería ser 404 (no encontrado)
    const again = await request(app).put(`/api/users/${id}`).send({ firstName: 'X' });
    // Si te devuelve 400 aquí, es porque el id no era uuid o no llegó; con el fix del POST será 404
    expectStatus(again, 404);
  });
});
