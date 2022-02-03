import { requireAuth , BadRequestError } from '@social-microservices/common';
import express , { NextFunction, Request , Response  } from 'express';
import { User } from '../models/user.model';

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
      
      res.status(200).send({ status : 200 , currentUser , success : true});
}); 

export { router as followUser };