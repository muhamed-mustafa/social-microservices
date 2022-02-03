import express , { Request , Response } from 'express'
import { requireAuth , upload, BadRequestError } from '@social-microservices/common';
import { User } from '../models/user.model';

const router = express.Router();

router.delete('/api/auth/user' , upload.none() , requireAuth , async(req : Request , res : Response ) =>
{
      const user = await User.findByIdAndDelete(req.currentUser!.id);

      if(!user)
      {
          throw new BadRequestError("User is not found!");
      }

      req.session = null;
      res.status(200).send({ status : 200 , message : "Deleted Successfully." , success : true });
});

export { router as deleteUser };