import express , { Request , Response } from 'express';
import { User } from '../models/user.model';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import mongoose from 'mongoose';

const router = express.Router();

router.delete('/api/auth/admin/ban' , requireAuth , async(req : Request , res : Response) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user?.isAdmin)
      {
          throw new BadRequestError('User have no this permission');
      }

      if (!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id))) 
      {
            throw new BadRequestError("Id Is Invalid");
      }

      const existingUser = await User.findById(req.query.id);

      if(!existingUser)
      {
          throw new BadRequestError('User is not exists.');
      }

      existingUser.ban = existingUser.ban.filter(e => e.id !== req.query.banId);

      if(existingUser.ban.length === 0)
      {
          existingUser.hasAccess = true;
      }

      await existingUser.save();

      res.status(200).send({ status : 200 , existingUser , success : true});
});

export { router as adminDeleteBan };