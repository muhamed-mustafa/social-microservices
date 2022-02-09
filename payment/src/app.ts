import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/new';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  createChargeRouter
]);

// Midlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
} , errorHandler);

export { app };
