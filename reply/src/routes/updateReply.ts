import express , { Request , Response } from 'express';
import { requireAuth , upload , BadRequestError } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { Reply } from '../models/reply.model';
import _ from 'lodash';

const router = express.Router();

router.patch('/api/reply' , upload.fields([{ 'name' : 'media' }]) , requireAuth , async(req : Request , res : Response) =>
{
      const files = req.files as { [ fieldname : string ] : Express.Multer.File[] };

      if(!req.query.replyId)
      {
          throw new BadRequestError('you must be defined replyId query');
      }

      const reply = await Reply.findById(req.query.replyId);
      if(!reply)
      {
          throw new BadRequestError('reply is not found!')
      }

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

      if(req.query.mediaId)
      {
          reply.media = reply.media.filter(arr => arr.id !== req.query.mediaId);
      };

      _.extend(reply , req.body);

      await reply.save();

      res.status(200).send({ status : 200 , reply , success : true });
});

export { router as updateReplyRouter };