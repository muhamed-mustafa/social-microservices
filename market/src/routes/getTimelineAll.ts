import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.get('/api/product/timeline/all' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const products = await Product.find();
      
      if(products.length === 0)
      {
            throw new BadRequestError('there is no products.');
      }

      res.status(200).send({status : 200 , products , success : true});
});

export { router as getAllTimelineRouter };