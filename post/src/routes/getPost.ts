import { BadRequestError, requireAuth  , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';

const router = express.Router();

router.get('/api/post' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{   
    const post = await Post.findById(req.query.postId);

    if(!post)
    {
        throw new BadRequestError('post is not found!');
    }

    res.status(200).json({status : 200  , post , success : true});
});

export { router as getPostById };