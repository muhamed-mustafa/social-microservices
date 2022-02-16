import express , { Request , Response } from 'express';
import { validationPhoto , upload, BadRequestError, requireAuth } from '@social-microservices/common';
import { Product } from '../models/product.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { natsWrapper } from '../nats-wrapper';
import { ProductCreatedPublisher } from '../events/publishers/product-created-publisher';

const router = express.Router();

router.post('/api/product/create' , upload.fields([{name : "images"}]) , validationPhoto , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as {[fieldname : string] : Express.Multer.File[]};

      if(!req.body)
      {
            throw new BadRequestError("Can't not send Empty Request");
      }

      if(!req.body.price)
      {
          throw new BadRequestError('price field is required.');
      }

      const newProduct = Product.build({ ...req.body , merchantId : req.currentUser!.id })

      if(files.images)
      {
          await new Promise((resolve , reject) =>
          {
              files.images.map(image =>
              { 
                    const imageId = randomBytes(16).toString('hex');
                    return Cloudinary.uploader.upload_stream({
                        public_id : `product-image/${imageId}-${image.originalname}/social-${newProduct.merchantId}`,
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
                            newProduct.images.push({id : imageId , URL : result?.secure_url!});
                            if(files.images.length === newProduct.images.length)
                            {
                                return resolve(newProduct.images);
                            }                           
                        }   
                    }).end(image.buffer);
              });
          });
      }

      await newProduct.save();
      await new ProductCreatedPublisher(natsWrapper.client).publish({
            id : newProduct.id,
            images : newProduct.images,
            price : newProduct.price,
            version : newProduct.version,
            merchantId : newProduct.merchantId,
            content : newProduct.content 
      });

      res.status(201).json({status : 201 , newProduct , message : "Product created Successfully!" , success : true});
});

export { router as createProductRouter };