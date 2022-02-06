import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUser, errorHandler, NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';
import { createPostRouter } from './routes/createPost';
import { deletePostRouter } from './routes/deletePost';
import { getPostRouter } from './routes/getAllPosts';
import { getPostById } from './routes/getPost';
import { getAllTimelineRouter } from './routes/getTimelineAll';
import { updatePostRouter } from './routes/updatePost';
import { likeOrDislikePostRouter } from './routes/likeOrDislikePost';
import { searchPost } from './routes/search';
import { searchAllPosts } from './routes/search-all';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  currentUser,
  createPostRouter,
  updatePostRouter,
  deletePostRouter,
  getPostRouter,
  getPostById,
  getAllTimelineRouter,
  likeOrDislikePostRouter,
  searchPost,
  searchAllPosts
]);

// Midlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
} , errorHandler);

export { app };
