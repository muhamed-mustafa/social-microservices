import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import mongoose from 'mongoose';
import { Comment } from '../models/comment.model';

const router = express.Router();

router.get('/api/reply' , requireAuth , async(req : Request , res : Response) =>
{
      if(!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id)))
      {
          throw new BadRequestError('id is invalid');
      }

      let comment = await Comment.findById(req.query.id).populate('replies');

      if(!comment)
      {
            throw new BadRequestError('comment not found!');
      }
      
      res.status(200).send({ status : 200 , comment , success : true });
});

export { router as showRepliesRouter };