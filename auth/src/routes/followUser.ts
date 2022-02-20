import { requireAuth , BadRequestError } from '@social-microservices/common';
import express , { NextFunction, Request , Response  } from 'express';
import { User } from '../models/user.model';
import { natsWrapper } from '../nats-wrapper';
import { FollowCreatedPublisher } from '../events/publishers/follow-created-publisher';

const router = express.Router();

router.patch('/api/auth/user/follow' , requireAuth , async(req : Request , res : Response , next : NextFunction ) =>
{
    let user = await User.findById(req.query.id);
    if(!user)
    {
        throw new BadRequestError('user in not exists');
    };

    user.updateOne({$push : { followers : req.currentUser!.id }});

    const currentUser = await User.findByIdAndUpdate(req.currentUser!.id , {$push : {following : user}} , {new : true});

    const userData = await user.save();
    const currentUserData = await currentUser!.save();

    if(userData && currentUserData)
    {
        await new FollowCreatedPublisher(natsWrapper.client).publish({
            follower  : currentUserData.id,
            following : userData.id,
            currentUserVersion : currentUserData.version,
            userVersion : userData.version 
        });
    };
    
    res.status(200).send({ status : 200 , currentUser , success : true});
}); 

export { router as followUser };