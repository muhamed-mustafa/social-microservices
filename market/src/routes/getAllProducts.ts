import { BadRequestError, requireAuth  , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.get('/api/products' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{   
    const product = await Product.find({userId : req.currentUser!.id});

    if(product.length === 0)
    {
        throw new BadRequestError('there is no products');
    }

    res.status(200).json({status : 200  , product , success : true});
});

export { router as getProductRouter };