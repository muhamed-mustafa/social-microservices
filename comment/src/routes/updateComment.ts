import express , { Request , Response } from 'express';
import { requireAuth , upload , BadRequestError } from '@social-microservices/common';
import { Comment } from '../models/comment.model';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import _ from 'lodash';

const router = express.Router();

router.patch('/api/comment' , upload.fields([{ 'name' : 'media' }]) , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as { [ fieldname : string ] : Express.Multer.File[] };

      const comment = await Comment.findById(req.query.id);
      if(!comment)
      {
            throw new BadRequestError('comment not found!');
      }
      
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

      if(req.query.mediaId)
      {
         comment.media = comment.media.filter(arr => arr.id !== req.query.mediaId);
      }

      _.extend(comment , req.body);

      await comment.save();

      res.status(200).send({ status : 200, comment , success : true });
});

export { router as updateCommentRouter };