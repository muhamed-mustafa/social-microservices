import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError , NotFoundError } from '@social-microservices/common';
import { Product } from '../models/product';
import { Order , OrderStatus } from '../models/order';

const router = express.Router();

router.post('/api/order' , requireAuth , async (req : Request , res : Response) =>
{
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if(!product)
    {
        throw new NotFoundError();
    }

    const isReserved = await product.isReserved();
    if(isReserved)
    {
        throw new BadRequestError('Ticket is already reserved');
    }

    const expires = Date.now() + Number(process.env.EXPIRATION_WINDOW_MILLIE_SECOND!); // 1 hour

    // Build the order and save it to the database
    const order = Order.build({
        product,
        userId : req.currentUser!.id,
        status : OrderStatus.Complete,
        expiresAt : new Date(expires).toISOString()
    });
    
    await order.save();

    res.status(201).send(order);
});

export { router as createOrderRouter };