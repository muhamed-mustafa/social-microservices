import { BadRequestError, requireAuth  , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';

const router = express.Router();

router.get('/api/posts' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{   
    const post = await Post.find({userId : req.currentUser!.id});

    if(post.length === 0)
    {
        throw new BadRequestError('there is no posts');
    }

    res.status(200).json({status : 200  , post , success : true});
});

export { router as getPostRouter };