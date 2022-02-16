import express , { Request , Response } from 'express';
import jwt from 'jsonwebtoken';
import address from 'address';
import { upload , validationPhoto , BadRequestError  , validateUserSignUpData , GenderType , ProfilePictureType } from '@social-microservices/common';
import { v2 as Cloudinary } from 'cloudinary';
import { User } from '../models/user.model';
import { OAuth2Client } from 'google-auth-library';
import nodemailer , { TransportOptions } from 'nodemailer';
import { randomBytes } from 'crypto';

const router = express.Router();

router.post('/api/auth/signup' , upload.fields([{ name : "profilePicture" , maxCount : 1} , { name : "coverPicture" , maxCount : 1}]) ,
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

        else
        {
                if (user.gender === GenderType.Male) 
                {
                    user.profilePicture = ProfilePictureType.Male;
                } 
                
                else 
                {
                    user.profilePicture = ProfilePictureType.Female;
                }
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

        // generate JWT and then store it on session object
        const userJwt = jwt.sign({ id : user.id , email : user.email} , process.env.JWT_KEY!);
        req.session   = { jwt : userJwt };

        const client = await new OAuth2Client({
            clientId : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_SECRET,
            redirectUri : process.env.REDIRECT_URL
        });

        client.setCredentials({ refresh_token : process.env.REFRESH_TOKEN });
        const accessToken = await client.getAccessToken();

        let activeKey = randomBytes(8).toString('hex');

        let transport = await nodemailer.createTransport({
           host : "smtp.gmail.com",
           port : process.env.MAIL_SERVER_PORT,
           secure : true,
           auth :  nodemailerAccessTokenIsExpired(accessToken),
           tls  :
           {
               rejectUnauthorized : true
           }
        } as TransportOptions);

        const message = 
        {
            from : 'Social-Microservices Support" <no-reply@social-microservices>',
            to : user.email,
            subject : "Social-Microservices Support",
            html: `
                        <div style="text-align: center;  font-family: sans-serif">
                            <img src="https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" alt="Social-Microservices" style="width: 250px">
                            <div style="text-align: center; margin: auto; padding: 20px; background: #FFFFFF; color: #041438">
                                <h1 style="direction: ltr">Just one more step...</h1>
                                <h2>${user.username}</h2>
                                <p style="font-size: 16px">
                                 activate your Social-Microservices account 
                                </p>
                                <p style="color: #FFFFFF; text-decoration: none; background: #041438; padding: 15px 0; display: block; width: 170px; margin: auto; text-transform: Capitalize; font-size: 18px; font-weight: bold">${activeKey}</p>
                            </div>
                            <div style="margin: 20px; background: transparent; color: #041438">
                                <p style="font-size: 14px; direction: ltr">If you think something is wrong please
                                    <a  style="color: #041438; text-transform: uppercase;" href="" target="_blank">contact us</a>
                                </p>
                                <p style="margin: 20px 0; direction: ltr">&copy; 2022 - <a style="color: #041438; direction: ltr" href="mailto:techno@beta.ai">Social-Microservices Technical Team</a>, All rights reserved</p>
                          </div>
                    `,
        };

        transport.verify((err) =>
        {
            if(err)
            {
                console.error(err);
            }

            else
            {
                console.log("server is ready to send email");
            }
        });

        // sending mail
        await transport.sendMail(message , async(err) =>
        {
            if(err)
            {
                console.log(err);
                throw new BadRequestError("Account was created but the activation email not sent");
            }

            else
            {
                user.activeKey = activeKey;
                await user.save();
                res.status(201).send({ status : 201 , user , success : true})
            }
        });
});

const nodemailerAccessTokenIsExpired = (accessToken : any) => 
{
    if (new Date() > new Date(accessToken.res.data.expiry_date)) 
    {
        return {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        };
    }
    
    else 
    {
        return {
            type: "OAuth2",
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken,
        };
    }
};

export { router as signUpRouter };