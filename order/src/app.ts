import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { indexOrderRouter } from './routes';
import { showOrderRouter } from './routes/show';
import { createOrderRouter } from './routes/new';
import { updateOrderRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  indexOrderRouter,
  showOrderRouter,
  createOrderRouter,
  updateOrderRouter,
]);

// Midlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
} , errorHandler);

export { app };
