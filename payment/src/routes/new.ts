import express , { Request , Response } from 'express';
import { requireAuth , NotAuthorizedError , NotFoundError , BadRequestError , OrderStatus } from '@social-microservices/common';
import { Order } from '../models/order.model';
import { stripe } from '../stripe';
import { Payment } from '../models/payment.model';

const router = express.Router();

router.post('/api/payment' , requireAuth , async (req : Request , res : Response) =>
{
      const { token , orderId } = req.body;

      const order = await Order.findById(orderId);
      if(!order)
      {
          throw new NotFoundError();
      }

      if(order.userId !== req.currentUser!.id)
      {
          throw new NotAuthorizedError();
      }

      if(order.status === OrderStatus.Cancelled)
      {
          throw new BadRequestError('Cannot pay for an cancelled order');
      }

      const charge = await stripe.charges.create({
        currency : "usd",
        amount : order.price * 100,
        source : token
      });

      const payment = Payment.build({ orderId , stripeId : charge.id });
      await payment.save();
      
      res.status(201).send({ id : payment.id });
});

export { router as createChargeRouter };