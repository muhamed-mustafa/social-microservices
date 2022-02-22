import express , { Request , Response } from 'express';
import { validationPhoto , upload, BadRequestError, requireAuth } from '@social-microservices/common';
import { Post } from '../models/post.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { PostCreatedPublisher } from '../events/publishers/post-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/post' , upload.fields([{name : "images"}]) , validationPhoto , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as {[fieldname : string] : Express.Multer.File[]};

      if(!req.body)
      {
            throw new BadRequestError("Can't not post Empty Request");
      }

      const newPost = Post.build({ content : req.body.content , author : req.currentUser!.id })

      if(files.images)
      {
          await new Promise((resolve , reject) =>
          {
              files.images.map(image =>
              { 
                    const imageId = randomBytes(16).toString('hex');
                    return Cloudinary.uploader.upload_stream({
                        public_id : `post-image/${imageId}-${image.originalname}/social-${newPost.author}`,
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
                            newPost.images.push({id : imageId , URL : result?.secure_url!});
                            if(files.images.length === newPost.images.length)
                            {
                                return resolve(newPost.images);
                            }
                        }   
                    }).end(image.buffer);
              });
          });
      }
      
      await newPost.save();

      await new PostCreatedPublisher(natsWrapper.client).publish({
            id : newPost.id,
            author : newPost.author,
            version : newPost.version
      });

      res.status(201).json({status : 201 , newPost , message : "Post created Successfully!" , success : true});
});

export { router as createPostRouter };