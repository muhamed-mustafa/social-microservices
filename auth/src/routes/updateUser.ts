import express , { Request , Response } from 'express'
import { requireAuth , validationPhoto , upload, BadRequestError } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import { User } from '../models/user.model';
import _ from 'lodash';
import { Password } from '../services/Password';
import jwt from 'jsonwebtoken';
import { UserUpdatedPublisher } from '../events/publishers/user-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

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
            const specialCharactersValidator = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
            if(req.body.password.includes('password') || req.body.password.includes('asdf') || req.body.password.length < 8)
            {
                throw new BadRequestError('Password is too week.');
            }

            if(!specialCharactersValidator.test(req.body.password))
            {
                throw new BadRequestError('Password must contain a special character.');
            }

            if(req.body.password.length < 8)
            {
                throw new BadRequestError('password must be more 8 characters');
            }

            let isTheSamePassword = await Password.compare(user.password , req.body.password);

            if (isTheSamePassword) 
            {
                throw new BadRequestError("Can not change password with the previous one");
            }

            user.password = req.body.password;
       }

       if(req.body.email)
       {
            const existingEmail = await User.findOne({ email : req.body.email });

            if(existingEmail)
            {
                throw new BadRequestError('Email is exists, choose another email');
            }

            user.email = req.body.email;

            req.session = null;
            const userJwt = jwt.sign({ id : user.id , email : user.email } , process.env.JWT_KEY!);
            req.session = { jwt : userJwt };
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
                      user!.coverPicture = result?.secure_url!;
                      resolve(user.coverPicture)
                  }   
              }).end(files.coverPicture[0].buffer);
          });
      }

      _.extend(user , req.body);
      const savedData = await user.save();
      if(savedData)
      {
            const bodyData : { [key : string] : string; } = {}

            _.each(req.body , (value , key : string) =>
            {
                const fields = ["email" , "username" , "profilePicture" , "coverPicture"];
                fields.forEach(el =>
                {
                    if(key === el)
                    {
                        bodyData[key] = value;
                    }
                });
            });

            await new UserUpdatedPublisher(natsWrapper.client).publish({
                id : savedData.id,
                ...bodyData,
                version : savedData.version
            });
      };

      res.status(200).send({ status : 200 , user , success : true });
});

export { router as updatedUser };