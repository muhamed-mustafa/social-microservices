import express , { Request , Response } from 'express';
import { upload , BadRequestError , requireAuth } from '@social-microservices/common';
import { User } from '../models/user.model';

const router = express.Router();

router.patch('/api/auth/active' , upload.none() , requireAuth , async (req : Request , res : Response) =>
{
      const user = await User.findById(req.currentUser!.id);
      if(!user)
      {
          throw new BadRequestError('user not exist');
      }

      if(!req.body.activeKey)
      {
          throw new BadRequestError("Active Key Is Required");
      }

      if(req.body.activeKey === user.activeKey)
      {
          user.active = true;
      }

      await user.save();
      res.status(200).send({ status: 200 , user , success: true });
});

export { router as activeRouter };