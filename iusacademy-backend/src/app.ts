// src/app.ts
import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users';
// import { authRouter } from './routes/auth'; // si lo usas

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
// app.use('/api/auth', authRouter);

export default app;
