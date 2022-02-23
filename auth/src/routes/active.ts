import express , { Request , Response } from 'express';
import { upload , BadRequestError , requireAuth } from '@social-microservices/common';
import { User } from '../models/user.model';
import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch('/api/auth/active' , upload.none() , requireAuth , async (req : Request , res : Response) =>
{
      const user = await User.findOne({ email : req.currentUser!.email });
      if(!user)
      {
          throw new BadRequestError('user not exist');
      }

      if(!req.body.activeKey)
      {
          throw new BadRequestError("Active Key Is Required");
      }

      if(req.body.activeKey !== user.activeKey)
      {
            throw new BadRequestError('active key is invalid');
      }

      user.active = true;
      const savedData = await user.save();
      
      if(savedData)
      {
        await new UserUpdatedPublisher(natsWrapper.client).publish({
            id : savedData.id,
            version : savedData.version
         });
      }

      res.status(200).send({ status: 200 , user , success: true });
});

export { router as activeRouter };

