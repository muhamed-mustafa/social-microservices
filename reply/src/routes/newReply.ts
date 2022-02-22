import express , { Request , Response } from 'express';
import { requireAuth , upload , BadRequestError } from '@social-microservices/common';
import { Comment } from '../models/comment.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { Reply } from '../models/reply.model';

const router = express.Router();

router.post('/api/reply' , upload.fields([{ 'name' : 'media' }]) , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as { [ fieldname : string ] : Express.Multer.File[] };

      if(!req.query.commentId)
      {
          throw new BadRequestError('you must be defined commentId query');
      };

      const comment = await Comment.findById(req.query.commentId);

      if(!comment)
      {
          throw new BadRequestError('comment not found');
      }

      let reply = Reply.build({ userId : req.currentUser!.id , comment : comment!.id , ...req.body });

      if(files.media)
      {
          await new Promise((resolve , reject) =>
          {
              files.media.map(mediaData =>
              {
                  const mediaId = randomBytes(16).toString('hex')
                  return Cloudinary.uploader.upload_stream({
                    public_id : `reply-${mediaData.mimetype}/${mediaId}-${mediaData.originalname}/social-${reply.userId}`,
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
                          reply.media.push({ id : mediaId , URL : result?.secure_url! });
                          if(files.media.length === reply.media.length)
                          {
                              return resolve(reply.media);
                          }
                      }
                  }).end(mediaData.buffer);
              })
          })
      }

      await reply.save();

      res.status(201).send({ status : 201 , reply , success : true });
});

export { router as newReplyRouter };