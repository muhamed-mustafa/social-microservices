import express , { Request , Response } from 'express';
import { User } from '../models/user.model';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import mongoose from 'mongoose';

const router = express.Router();

router.delete('/api/auth/admin' , requireAuth , async(req : Request , res : Response ) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user)
      {
            throw new BadRequestError('user is not found!')
      }

      if(user?.roles !== 'admin')
      {
            throw new BadRequestError('User have no this permission');
      };

      if (!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id))) 
      {
            throw new BadRequestError("Id Is Invalid");
      }

      await User.findByIdAndRemove(req.query.id);

      res.status(204).send({});
});

export { router as adminDeleteUsers };