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

        const fields : { [key : string] : any} = {};
        
        delete fields['version'];

        product.set({ ...fields });

        await product.save();

        msg.ack();
    };
};