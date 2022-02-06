import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { createProductRouter } from './routes/createProduct';
import { deleteProductRouter } from './routes/deleteProduct';
import { updateProductRouter } from './routes/updateProduct';
import { getProductRouter } from './routes/getAllProducts';
import { getProductById } from './routes/getProduct';
import { getAllTimelineRouter } from './routes/getTimelineAll';
import { likeOrDislikeProductRouter } from './routes/likeOrDislikeProduct'; 

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  createProductRouter,
  updateProductRouter,
  deleteProductRouter,
  getProductRouter,
  getProductById,
  getAllTimelineRouter,
  likeOrDislikeProductRouter
]);

// Midlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
} , errorHandler);

export { app };
