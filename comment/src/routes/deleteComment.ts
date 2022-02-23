import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import { Comment } from '../models/comment.model';
import mongoose from 'mongoose';
import { CommentDeletedPublisher } from '../events/publishers/comment-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.get('/api/comment' , requireAuth , async(req : Request , res : Response) =>
{

      if(!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id)))
      {
          throw new BadRequestError('id is invalid');
      }

      let comment = await Comment.findByIdAndDelete(req.query.id)
      
      if(!comment)
      {
            throw new BadRequestError('comment not found!');
      }
      
        await new CommentDeletedPublisher(natsWrapper.client).publish({
            id : comment.id,
            postId : comment.post,
            productId : comment.product
        });
      
      res.send({ status : 204 , message : "Comment Deleted Successfully..." , success : true });
});

export { router as deleteCommentRouter };