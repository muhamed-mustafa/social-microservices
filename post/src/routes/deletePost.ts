import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';
import { PostDeletedPublisher } from '../events/publishers/post-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();


router.delete('/api/post' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const post = await Post.findById(req.query.id);
      if(!post)
      {
          throw new BadRequestError('post is not found!');
      }

      if(post.author !== req.currentUser!.id)
      {
          throw new BadRequestError('you can delete only your posts!');
      }

      await post.deleteOne();
      await new PostDeletedPublisher(natsWrapper.client).publish({
            id : post.id
      });
      
      res.send({status : 204 , message : "Post has been deleted Successfully!" , success : true});
});

export { router as deletePostRouter };