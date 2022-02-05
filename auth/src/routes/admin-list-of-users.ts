import express , { Request , Response } from 'express';
import { User } from '../models/user.model';
import { requireAuth , BadRequestError } from '@social-microservices/common';

const router = express.Router();

router.get('/api/auth/admin' , requireAuth , async(req : Request , res : Response ) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user?.isAdmin)
      {
            throw new BadRequestError('User have no this permission');
      };

      const users = await User.find({});

      if(users.length === 0)
      {
          throw new BadRequestError('there is no users...');
      }
      
      const filterUsers = users.filter(e => { return !e.isAdmin });

      res.status(200).send({ status : 200 , filterUsers , success : true });
});

export { router as adminListOfUsers };