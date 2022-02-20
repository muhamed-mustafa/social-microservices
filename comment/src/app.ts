import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser , errorHandler , NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
]);

// Middlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
