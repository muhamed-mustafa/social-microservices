import express , { Request , Response } from 'express';
import { User } from '../models/user.model';
import { requireAuth , BadRequestError } from '@social-microservices/common';

const router = express.Router();

router.delete('/api/auth/admin' , requireAuth , async(req : Request , res : Response ) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user)
      {
            throw new BadRequestError('user is not found!')
      }

      if(!user?.isAdmin)
      {
            throw new BadRequestError('User have no this permission');
      };

      await User.findByIdAndRemove(req.query.id);

      res.status(204).send({});
});

export { router as adminDeleteUsers };