import { Subjects , Listener , ProductCreatedEvent } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/product.model";
import { queueGroupName } from "./queue-group-name";

export class ProductCreatedListener extends Listener<ProductCreatedEvent>
{
    readonly subject = Subjects.ProductCreated;
    queueGroupName   = queueGroupName;

    async onMessage(data : ProductCreatedEvent['data'] , msg : Message)
    {
        const product = Product.build({ id : data.id , merchantId : data.merchantId });

        await product.save();

        msg.ack();
    };
};