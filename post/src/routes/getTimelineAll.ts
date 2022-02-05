import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';

const router = express.Router();

router.get('/api/post/timeline/all' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      // const currentUser = await Post.findById(req.currentUser!.id);
      // const userPosts   = await Post.find({ userId : currentUser?.id });

      // todo: publish user data to timeline rout in post service

      // const friendPosts = await Promise.all(
      //   currentUser.followings.map((friendId) =>
      //   {
      //       return Post.find({ userId : friendId });
      //   })
      // );

      // res.json(userPosts.concat(...friendPosts));

      const posts = await Post.find();
      
      if(posts.length === 0)
      {
            throw new BadRequestError('there is no posts.');
      }

      res.status(200).send({status : 200 , posts , success : true});
});

export { router as getAllTimelineRouter };