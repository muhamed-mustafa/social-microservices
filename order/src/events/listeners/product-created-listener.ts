import { Message } from "node-nats-streaming"; 
import { Subjects , ProductCreatedEvent } from "@social-microservices/common";
import { Product } from "../../models/product";
import { QueueGroupName } from "./queue-group-name";
import { Listener } from "./base-listener";

export class ProductCreatedListener extends Listener<ProductCreatedEvent>
{
    readonly subject = Subjects.ProductCreated;
    queueGroupName   = QueueGroupName;
    
    async onMessage(data : ProductCreatedEvent['data'] , msg : Message)
    {
        const { id , content , price , images } = data;

        const product = Product.build({ id , content , price , images });

        await product.save();

        msg.ack()
    };
};