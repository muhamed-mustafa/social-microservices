import { BadRequestError, requireAuth } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.patch('/api/product/like' , requireAuth , async(req : Request , res : Response) =>
{
    const product = await Product.findById(req.query.id);
    if(!product)
    {
        throw new BadRequestError('product is not found!');
    }

    if(product.likes.includes(req.currentUser!.id))
    {
        product.likes = product.likes.filter(like => like !== req.currentUser!.id)
    }

    else
    {
        product.likes.push(req.currentUser!.id);
    }

    await product.save();
    res.status(200).send({ status : 200 , product , success : true });
});

export { router as likeOrDislikeProductRouter };
