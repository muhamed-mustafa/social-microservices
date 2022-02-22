import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser , errorHandler , NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { newCommentRouter } from './routes/newComment';
import { showCommentRouter } from './routes/showComment';
import { showCommentsRouter } from './routes/all-Comments';
import { updateCommentRouter } from './routes/updateComment';
import { deleteCommentRouter } from './routes/deleteComment';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  newCommentRouter,
  showCommentRouter,
  showCommentsRouter,
  updateCommentRouter,
  deleteCommentRouter
]);

// Middlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
