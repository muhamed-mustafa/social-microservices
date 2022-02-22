import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
const router = express.Router();

router.get('/api/post/timeline/all' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const currentUser = await User.findById(req.currentUser!.id);

      const userPosts   = await Post.find({ author : currentUser?.id });

      const friendPosts = await Promise.all(
        currentUser!.followings.map((friendId) =>
        {
            return Post.find({ author : friendId });
        })
      );

      const posts = userPosts.concat(...friendPosts);

      res.status(200).send({status : 200 , posts : posts , success : true});
});

export { router as getAllTimelineRouter };