// src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.send('OK'));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
