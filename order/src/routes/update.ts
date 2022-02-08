import express , { Request , Response } from 'express';
import { requireAuth , NotAuthorizedError , NotFoundError } from '@social-microservices/common';
import { Order , OrderStatus } from '../models/order';

const router = express.Router();

router.patch('/api/order' , requireAuth , async (req : Request , res : Response) =>
{
    const { orderId } = req.query;
    const order = await Order.findById(orderId).populate('product');

    if(!order)
    {
        throw new NotFoundError();
    }

    if(order.userId !== req.currentUser!.id)
    {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();
    
    res.status(204).send(order);
});

export { router as updateOrderRouter };