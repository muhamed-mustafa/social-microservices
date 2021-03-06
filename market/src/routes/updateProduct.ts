import express , { Request , Response } from 'express';
import { validationPhoto , upload, BadRequestError, requireAuth } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import _ from 'lodash';
import { randomBytes } from 'crypto';
import { Product } from '../models/product.model';
import { natsWrapper } from '../nats-wrapper';
import { ProductUpdatedPublisher } from '../events/publishers/product-updated-publisher';

const router = express.Router();

router.patch('/api/product/update' , upload.fields([{name : "images"}]) , validationPhoto , requireAuth ,  async(req : Request , res : Response) =>
{
      const files = req.files as {[fieldname : string] : Express.Multer.File[]};

      const product = await Product.findById(req.query.id);

      if(!product)
      {
          throw new BadRequestError('product is not found!');
      }

      if(files.images)
      {
          await new Promise((resolve , reject) =>
          {
              files.images.map(image =>
              {
                    const imageId = randomBytes(16).toString('hex');
                    return Cloudinary.uploader.upload_stream({
                        public_id : `product-image-${imageId}-${image.originalname}/social-${product.merchantId}`,
                        use_filename : true,
                        tags : `${imageId}-tag`,
                        width : 500,
                        height : 500,
                        crop : "scale",
                        placeholder : true,
                        resource_type : 'auto'
                    } , async(err , result) =>
                    {
                        if(err)
                        {
                            console.log(err);
                            reject(err);
                        }
    
                        else
                        {
                            product.images.push({ id : imageId , URL : result?.secure_url!});
                            if(files.images.length === product.images.length)
                            {
                                return resolve(product.images);
                            }
                        }   
                    }).end(image.buffer);
              })
          });
      }

      if(req.query.imageId)
      {
          product.images = product.images.filter(image => image.id !== req.query.imageId);
      }

      _.extend(product , req.body);
      await product.save();
      await new ProductUpdatedPublisher(natsWrapper.client).publish({
            id : product.id,
            images : product.images,
            price : product.price,
            version : product.version,
            merchantId : product.merchantId,
            content : product.content 
      });

      res.status(200).json({status : 200 , product , message : "Product Updated Successfully!" , success : true});
});

export { router as updateProductRouter };