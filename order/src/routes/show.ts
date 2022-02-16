import express , { Request , Response } from 'express';
import { requireAuth , NotAuthorizedError , NotFoundError } from '@social-microservices/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/order' , requireAuth , async (req : Request , res : Response) =>
{
    const order = await Order.findById(req.query.orderId).populate('product');
    
    if(!order)
    {
        throw new NotFoundError();
    }

    if(order.buyerId !== req.currentUser!.id)
    {
        throw new NotAuthorizedError();
    }

    res.send(order);
});

export { router as showOrderRouter };