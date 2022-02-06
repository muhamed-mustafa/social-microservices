import { BadRequestError, requireAuth } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Post } from '../models/post.model';

const router = express.Router();

router.get('/api/post/search' , requireAuth , async(req : Request , res : Response) =>
{
    const { search } = req.query;
    if(!search)
    {
        throw new BadRequestError('search query is required.');
    }

    const posts = await Post.find({ userId : req.currentUser!.id });

    const postSearch = posts.filter(post => post.desc.toLowerCase().includes(search.toString().toLowerCase()));

    if(posts.length === 0 || postSearch.length === 0)
    {
        throw new BadRequestError('there is no posts');
    }

    res.status(200).send({ status : 200 , post : postSearch , success : true});
});

export { router  as searchPost };