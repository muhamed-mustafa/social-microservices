import { Message } from "node-nats-streaming";
import { Subjects , OrderCreatedEvent , Listener } from "@social-microservices/common";
import { QueueGroupName } from "./queue-qroup-name";
import { Product } from "../../models/product.model";
import { ProductUpdatedPublisher } from "../publishers/product-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>
{
    readonly subject =  Subjects.OrderCreated;
    queueGroupName   = QueueGroupName;

    async onMessage(data : OrderCreatedEvent['data'] , msg : Message)
    {
        const product = await Product.findById(data.product.id);
        if(!product)
        {
            throw new Error('product not found!');
        }

        product.set({ orderId : data.id });
        await product.save();

        await new ProductUpdatedPublisher(this.client).publish({
          id : product.id,
          orderId : product.orderId,
          images : product.images,
          price : product.price,
          version : product.version,
          merchantId : product.merchantId,
          content : product.content 
        });

        msg.ack();
    };
};
