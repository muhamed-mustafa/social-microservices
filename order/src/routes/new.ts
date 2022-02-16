import express , { Request , Response } from 'express';
import { requireAuth , BadRequestError , NotFoundError } from '@social-microservices/common';
import { Product } from '../models/product';
import { Order , OrderStatus } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

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
        throw new BadRequestError('Product is already reserved');
    }

    const expires = Date.now() + Number(process.env.EXPIRATION_WINDOW_MILLIE_SECOND!); // 1 hour

    // Build the order and save it to the database
    const order = Order.build({
        product,
        buyerId : req.currentUser!.id,
        status : OrderStatus.Complete,
        expiresAt : new Date(expires).toISOString()
    });
    
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id : order.id,
        status : order.status,
        buyerId : order.buyerId,
        version : order.version,
        expiresAt : order.expiresAt,
        product :
        {
            id : product.id,
            price : product.price
        }
    });

    res.status(201).send(order);
});

export { router as createOrderRouter };