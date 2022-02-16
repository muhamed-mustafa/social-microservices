import express , { Request , Response } from 'express';
import { requireAuth , NotAuthorizedError , NotFoundError } from '@social-microservices/common';
import { Order , OrderStatus } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.patch('/api/order' , requireAuth , async (req : Request , res : Response) =>
{
    const { orderId } = req.query;
    const order = await Order.findById(orderId).populate('product');

    if(!order)
    {
        throw new NotFoundError();
    }

    if(order.buyerId !== req.currentUser!.id)
    {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
    
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id : order.id,
        version : order.version,
        product :
        {
            id : order.product.id
        }
    });

    res.status(204).send(order);
});

export { router as updateOrderRouter };