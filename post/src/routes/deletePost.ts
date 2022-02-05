import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';

const router = express.Router();

router.delete('/api/post/delete' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const post = await Post.findById(req.query.id);
      if(!post)
      {
          throw new BadRequestError('post is not found!');
      }

      if(post.userId !== req.currentUser!.id)
      {
          throw new BadRequestError('you can delete only your posts!');
      }

      await post.deleteOne();
      res.send({status : 204 , message : "Post has been deleted Successfully!" , success : true});
});

export { router as deletePostRouter };