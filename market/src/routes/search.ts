import { BadRequestError, requireAuth } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.get('/api/product/search' , requireAuth , async(req : Request , res : Response) =>
{
    const { search } = req.query;
    if(!search)
    {
        throw new BadRequestError('search query is required.');
    }

    const products = await Product.find({});

    const productSearch = products.filter(product => product.desc.toLowerCase().includes(search.toString().toLowerCase()));

    if(products.length === 0 || productSearch.length === 0)
    {
        throw new BadRequestError('there is no products');
    }

    res.status(200).send({ status : 200 , product : productSearch , success : true});
});

export { router  as searchProduct };