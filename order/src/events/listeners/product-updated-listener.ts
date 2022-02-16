import { Message } from "node-nats-streaming"; 
import { Subjects , ProductUpdatedEvent , Listener } from "@social-microservices/common";
import { Product } from "../../models/product";
import { QueueGroupName } from "./queue-group-name";

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent>
{
    readonly subject = Subjects.ProductUpdated;
    queueGroupName = QueueGroupName;

    async onMessage(data : ProductUpdatedEvent['data'] , msg : Message)
    {
        const product = await Product.findByEvent(data);

        if(!product)
        {
            throw new Error('product not found!');
        };

        const { content , price , images } = data;
        product.set({ content , price , images });
        await product.save();

        msg.ack();
    };
};