import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUserRouter } from './routes/current-user';
import { signUpRouter } from './routes/signup';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { updatedUser } from './routes/updateUser';
import { deleteUser } from './routes/deleteUser';
import { followUser } from './routes/followUser';
import { unfollowUser } from './routes/unFollowUser';
import { adminListOfUsers } from './routes/admin-list-of-users';
import { adminDeleteUsers } from './routes/admin-delete-users';
import { adminBanUsers } from './routes/admin-ban-users';
import { adminDeleteBan } from './routes/admin-delete-ban';
import { currentUser, errorHandler, NotFoundError } from '@social-microservices/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use([
  json(),
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' }),
  signinRouter,
  signUpRouter,
  currentUserRouter,
  signoutRouter,
  currentUser,
  updatedUser,
  deleteUser,
  followUser,
  unfollowUser,
  adminListOfUsers,
  adminDeleteUsers,
  adminBanUsers,
  adminDeleteBan
]);

// Midlewares
app.use(
  '*',
  async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
