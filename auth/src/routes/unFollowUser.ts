import { requireAuth , BadRequestError } from '@social-microservices/common';
import express , { NextFunction, Request , Response  } from 'express';
import { User } from '../models/user.model';
import { natsWrapper } from '../nats-wrapper';
import { UnFollowCreatedPublisher } from '../events/publishers/unfollow-created-event';

const router = express.Router();

router.patch('/api/auth/user/unfollow' , requireAuth , async(req : Request , res : Response , next : NextFunction ) =>
{
      let user = await User.findById(req.query.id);
      if(!user)
      {
          throw new BadRequestError('user in not exists');
      };

      user.updateOne({$pull : { followers : req.currentUser!.id }});
      const currentUser = await User.findByIdAndUpdate(req.currentUser!.id , {$pull : {following : user}} , {new : true});
      
      const userData = await user.save();
      const currentUserData = await currentUser!.save();

      if(userData && currentUserData)
      {
            await new UnFollowCreatedPublisher(natsWrapper.client).publish({
                follower  : currentUserData.id,
                following : userData.id,
                currentUserVersion : currentUserData.version,
                userVersion : userData.version 
            });
      };
      
      res.status(200).send({ status : 200 , currentUser , success : true});
}); 

export { router as unfollowUser };