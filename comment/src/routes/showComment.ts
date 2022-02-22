import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import { Comment } from '../models/comment.model';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/comment' , requireAuth , async(req : Request , res : Response) =>
{

      if(!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id)))
      {
          throw new BadRequestError('id is invalid');
      }

      let comment = await Comment.findById(req.query.id)
      .populate(
        [
            {
                Model : "Post",
                path  : "post"
            },

            {
                Model : "Product",
                path : "product"
            }
        ]
      );

      if(!comment)
      {
            throw new BadRequestError('comment not found!');
      }
      
      res.status(200).send({ status : 200 , comment , success : true });
});

export { router as showCommentRouter };