import { BadRequestError, requireAuth , upload } from '@social-microservices/common';
import express , { Request , Response } from 'express';
import { Product } from '../models/product.model';

const router = express.Router();

router.delete('/api/product/delete' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const product = await Product.findById(req.query.id);
      if(!product)
      {
          throw new BadRequestError('product is not found!');
      }

      if(product.userId !== req.currentUser!.id)
      {
          throw new BadRequestError('you can delete only your products!');
      }

      await product.deleteOne();
      res.send({status : 204 , message : "Product has been deleted Successfully!" , success : true});
});

export { router as deleteProductRouter };