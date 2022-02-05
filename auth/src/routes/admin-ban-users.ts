import express , { Request , Response } from 'express';
import { User } from '../models/user.model';
import { requireAuth , BadRequestError , upload } from '@social-microservices/common';
import moment from 'moment';

interface BanUser
{
    id : string;
    period : string;
    reason : string;
    end_in : string;
};

const router = express.Router();

router.patch('/api/auth/admin/ban' , upload.none() , requireAuth , async(req : Request , res : Response) =>
{
      const user = await User.findById(req.currentUser!.id);

      if(!user?.isAdmin)
      {
            throw new BadRequestError('User have no this permission');
      }

      const existingUser = await User.findById(req.query.id);

      if(!existingUser)
      {
            throw new BadRequestError('User is not exists.');
      }

      if(existingUser.isAdmin)
      {
            throw new BadRequestError('u can not delete this user because user is also admin.');
      }

      if(!req.body.reason)
      {
          throw new BadRequestError('Reason Ban is required.');
      }

      let num , str;
      if(req.body.period)
      {
          num = parseInt(req.body.period.match(/\d+/)[0]);
          str = req.body.period.replace(num , "");
          str === 'd' ? str = 'days' : str === 'm' ? str = 'months' : str = 'years'
      };

      existingUser.hasAccess = false;

      const ban =
      {
          period : req.body.period ? req.body.period : undefined,
          reason : req.body.reason,
          end_in : req.body.period ? moment().add(num , <moment.unitOfTime.DurationConstructor>str).format() : undefined,
      } as BanUser;

      existingUser.ban.push(ban);

      await existingUser.save();

      res.status(200).send({ status : 200 , existingUser , success : true});
});

export { router as adminBanUsers }; 