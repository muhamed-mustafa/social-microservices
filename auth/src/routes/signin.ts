import express , { Request , Response } from 'express';
import jwt from 'jsonwebtoken';
import address from 'address';
import { BadRequestError, upload } from '@social-microservices/common';
import { Password } from '../services/Password';
import { User } from '../models/user.model';
import moment from 'moment';

const router = express.Router();

router.post('/api/auth/signin' , upload.none() , async(req : Request , res : Response) =>
{
      const { email , password } = req.body;
      const existingUser = await User.findOne({ email });

      if(!existingUser)
      {
          throw new BadRequestError('Invalid credentials');
      }

      if(!existingUser.hasAccess)
      {
            existingUser.ban = existingUser.ban.filter(arr => new Date(arr.end_in) > new Date());
            if(existingUser.ban.length === 0)
            {
                existingUser.hasAccess = true;
            }
            
            await existingUser.save();

            await Promise.all(
                existingUser.ban.map(userBan =>
                {
                    if(userBan.end_in && (new Date(userBan.end_in) === new Date() || new Date(userBan.end_in) > new Date()))
                    {
                        throw new BadRequestError(`${existingUser.email} is banned and the reason is that the ${userBan.reason} until ${moment(userBan.end_in).format('DD/MM/YYYY')} the ban is removed ${moment(userBan.end_in).fromNow()}`);
                    }

                    if(!userBan.end_in)
                    {
                        throw new BadRequestError(`${existingUser.email} is ban forever and reason ${userBan.reason}`);
                    }
                })
            );
      }

      const passwordMatch = await Password.compare(existingUser.password , password);
      if(!passwordMatch)
      {
          throw new BadRequestError('Invalid credentials');
      }

      address.mac((err , addr) =>
      {
          if(err)
          {
              console.log(err);
          }

          else
          {
              existingUser.macAddress.map(el =>
              {
                  if(el.Mac !== addr)
                  {
                      return existingUser.macAddress.push({ Mac : addr });
                  }
              });
          }
      }); 

      // generate JWT and then store it on session object
      const userJwt = jwt.sign({ id : existingUser.id , email : existingUser.email} , process.env.JWT_KEY!);
      req.session   = { jwt : userJwt };

      res.status(200).send({ status : 200 , existingUser , success : true });
});

export { router as signinRouter };