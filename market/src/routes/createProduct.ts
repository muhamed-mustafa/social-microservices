import express , { Request , Response } from 'express';
import { validationPhoto , upload, BadRequestError, requireAuth } from '@social-microservices/common';
import { Product } from '../models/product.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';

const router = express.Router();

router.post('/api/product/create' , upload.fields([{name : "images"}]) , validationPhoto , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as {[fieldname : string] : Express.Multer.File[]};

      if(!req.body)
      {
            throw new BadRequestError("Can't not send Empty Request");
      }

      const newProduct = Product.build({ ...req.body , userId : req.currentUser!.id })

      if(files.images)
      {
          await new Promise((resolve , reject) =>
          {
              files.images.map(image =>
              { 
                    const imageId = randomBytes(16).toString('hex');
                    return Cloudinary.uploader.upload_stream({
                        public_id : `product-image/${imageId}-${image.originalname}/social-${newProduct.userId}`,
                        use_filename : true,
                        tags : `${imageId}-tag`,
                        width : 500,
                        height : 500,
                        crop : "scale",
                        placeholer : true,
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
                            return setTimeout(() =>
                            {
                                resolve(newProduct.images);

                            }, parseInt(`${files.images.length}000`))
                           
                        }   
                    }).end(image.buffer);
              });
          });
      }

      await newProduct.save();
      res.status(201).json({status : 201 , newProduct , message : "Product created Successfully!" , success : true});
});

export { router as createProductRouter };