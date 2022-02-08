import express , { Request , Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@social-microservices/common';

const router = express.Router();

router.get('/api/order' , requireAuth , async (req : Request , res : Response) =>
{
    const orders = await Order.find({ userId : req.currentUser!.id }).populate('product');
    res.send(orders);
});

export { router as indexOrderRouter };
