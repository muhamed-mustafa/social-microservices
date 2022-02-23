import express , { Request , Response } from 'express';
import { requireAuth , upload , BadRequestError } from '@social-microservices/common';
import { Post } from '../models/post.model';
import { Product } from '../models/product.model';
import { Comment } from '../models/comment.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { CommentCreatedPublisher } from '../events/publishers/comment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/comment' , upload.fields([{ 'name' : 'media'}]) , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as { [ fieldname : string ] : Express.Multer.File[] };

      if(!req.query.postId || !req.query.productId)
      {
          throw new BadRequestError('you must be defined postId or productId query');
      };

      let postId , productId;
      if(req.query.postId)
      {
          postId = await Post.findById(req.query.postId);
      }

      else
      {
          productId = await Product.findById(req.query.productId);
      }

      let comment = Comment.build({ userId : req.currentUser!.id , post : postId , product : productId , ...req.body });

      if(files.media)
      {
          await new Promise((resolve , reject) =>
          {
              files.media.map(mediaData =>
              {
                  const mediaId = randomBytes(16).toString('hex')
                  return Cloudinary.uploader.upload_stream({
                    public_id : `comment-${mediaData.mimetype}/${mediaId}-${mediaData.originalname}/social-${comment.userId}`,
                    use_filename : true,
                    tags : `${mediaId}-tag`,
                    width : 500,
                    height : 500,
                    crop : "scale",
                    placeholder : true,
                    resource_type : 'auto'
                  } , async (err , result) =>
                  {
                      if(err)
                      {
                         console.log(err);
                         reject(err);
                      }

                      else
                      {
                          comment.media.push({ id : mediaId , URL : result?.secure_url! });
                          if(files.media.length === comment.media.length)
                          {
                              return resolve(comment.media);
                          }
                      }
                  }).end(mediaData.buffer);
              })
          })
      }

      const commentData = await comment.save();
      if(commentData)
      {
        await new CommentCreatedPublisher(natsWrapper.client).publish({
            id : commentData.id,
            userId : commentData.userId,
            version : commentData.version,
            postId  : commentData.post,
            productId : commentData.product
        });
      }

      res.status(201).send({ status : 201 , comment , success : true });
});

export { router as newCommentRouter };