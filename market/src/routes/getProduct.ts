import { BadRequestError, requireAuth  , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.get('/api/product' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{   
    const product = await Product.findById(req.query.productId);

    if(!product)
    {
        throw new BadRequestError('product is not found!');
    }

    res.status(200).json({status : 200  , product , success : true});
});

export { router as getProductById };