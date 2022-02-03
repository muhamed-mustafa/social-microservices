import express , { Request , Response } from 'express'
import { requireAuth , validationPhoto , upload, BadRequestError } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import { User } from '../models/user.model';
import _ from 'lodash';
import { Password } from '../services/Password';

const router = express.Router();

router.patch('/api/auth/user' , upload.fields([{name : "profilePicture" , maxCount : 1} , {name : "coverPicture" , maxCount : 1}]) , requireAuth , validationPhoto  , async(req : Request , res : Response ) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user)
      {
          throw new BadRequestError("User is not found!");
      }

      if(req.body.password)
       { 
            let isTheSamePassword = await Password.compare(user.password , req.body.password);

            if (isTheSamePassword) 
            {
                throw new BadRequestError("Can not change password with the previous one");
            }

            user.password = req.body.password;
       }

      const files = req.files as {[fieldname : string] : Express.Multer.File[]};

      if(files.profilePicture)
      {
          await new Promise((resolve , reject) =>
          {
              Cloudinary.uploader.upload_stream({
                  public_id : `profile-picture/social-${user.username}`,
                  use_filename : true,
                  tags : `${user.username}-tag`,
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
                      user.profilePicture = result?.secure_url!;
                      resolve(user!.profilePicture)
                  }   
              }).end(files.profilePicture[0].buffer);
          });
      }

      if(files.coverPicture)
      {
          await new Promise((resolve , reject) =>
          {
              Cloudinary.uploader.upload_stream({
                  public_id : `cover-picture/social-${user.username}`,
                  use_filename : true,
                  tags : `${user.username}-tag`,
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
                      user!.coverPicture = result?.secure_url!;
                      resolve(user.coverPicture)
                  }   
              }).end(files.coverPicture[0].buffer);
          });
      }

      _.extend(user , req.body);
      await user.save();
      res.status(200).send({ status : 200 , user , success : true });
});

export { router as updatedUser };