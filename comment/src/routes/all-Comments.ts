import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError } from '@social-microservices/common';
import { Post } from '../models/post.model';
import { Product } from '../models/product.model';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/comment' , requireAuth , async(req : Request , res : Response) =>
{
      if(!req.query.id || !mongoose.Types.ObjectId.isValid(String(req.query.id)))
      {
          throw new BadRequestError('id is invalid');
      }

      let comments;
      
      if(req.query.postId)
      {
          comments = await Post.findById(req.query.postId).populate('comments');

          return res.status(200).send({ status : 200 , comments , success : true });
      }

      else if(req.query.productId)
      {
          comments = await Product.findById(req.query.productId).populate('comments');

          return res.status(200).send({ status : 200 , comments , success : true });
      }

      else
      {
            throw new BadRequestError('you must be defined postId or productId query');
      }
});

export { router as showCommentsRouter };