import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import mongoose from 'mongoose';
import { Reply } from '../models/reply.model';

const router = express.Router();

router.delete('/api/reply' , requireAuth , async(req : Request , res : Response) =>
{
      if(!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id)))
      {
          throw new BadRequestError('id is invalid');
      }

      let reply = await Reply.findByIdAndDelete(req.query.id);

      if(!reply)
      {
            throw new BadRequestError('reply not found!');
      }
      
      res.send({ status : 204 , message : "Reply Deleted Successfully..." , success : true });
});

export { router as deleteReplyRouter };