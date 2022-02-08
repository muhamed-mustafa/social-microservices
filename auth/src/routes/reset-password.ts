import { upload , BadRequestError } from "@social-microservices/common";
import express, { Request , Response } from "express";
import { User } from "../models/user.model";
import { Password } from "../services/Password";

const router = express.Router();

router.patch("/api/auth/reset", upload.none(), async (req: Request, res: Response) => {

    const user = await User.findOne({ email : req.query.email });

    if(!user)
    {
        throw new BadRequestError("user is not exist");
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
             throw new BadRequestError('assword must be more 8 characters');
         }

         let isTheSamePassword = await Password.compare(user.password , req.body.password);

         if (isTheSamePassword) 
         {
             throw new BadRequestError("Can not change password with the previous one");
         }

         user.password = req.body.password;
    }

    await user.save();

    res.status(200).send({ status: 200 , user , message:"reset password successfully.", success: true, });

});

export { router as resetPasswordRouter };