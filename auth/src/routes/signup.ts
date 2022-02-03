import express , { Request , Response } from 'express';
import jwt from 'jsonwebtoken';
import address from 'address';
import { upload , validationPhoto , BadRequestError  , validateUserSignUpData } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import { User } from '../models/user.model';

const router = express.Router();

router.post('/api/auth/signup' , 
upload.fields([{ name : "profilePicture" , maxCount : 1} , { name : "coverPicture" , maxCount : 1}]) ,
 validationPhoto  , validateUserSignUpData , async (req : Request , res : Response) =>
{
        const files = req.files as {[fieldname : string] : Express.Multer.File[]};
        
        const { email , username } = req.body;
        const existingUser = await User.findOne({ email });
        
        if(existingUser)
        {
            throw new BadRequestError('Email in use!');
        }

        const existUsername = await User.findOne({ username });
        if(existUsername)
        {
            throw new BadRequestError('Username is already exists.');
        }

        let user = User.build({ ...req.body });

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

        address.mac((err , addr) =>
        {
            if(err)
            {
                console.log(err);
            }

            return user.macAddress.push({ Mac : addr });
        }); 

        await user.save();

        // generate JWT and then store it on session object
        const userJwt = jwt.sign({ id : user.id , email : user.email} , process.env.JWT_KEY!);
        req.session   = { jwt : userJwt };

        res.status(201).send({ user });
});

export { router as signUpRouter };