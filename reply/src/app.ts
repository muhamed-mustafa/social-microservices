import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser , errorHandler , NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { newReplyRouter } from './routes/newReply';
import { showReplyRouter } from './routes/showReply';
import { showRepliesRouter } from './routes/showAllReplies';
import { showRepliesForUserRouter } from './routes/showRepliesForUser';
import { updateReplyRouter } from './routes/updateReply';
import { deleteReplyRouter } from './routes/deleteReply';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  newReplyRouter,
  showReplyRouter,
  showRepliesRouter,
  showRepliesForUserRouter,
  updateReplyRouter,
  deleteReplyRouter
]);

// Middlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
