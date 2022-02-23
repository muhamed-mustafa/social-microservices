import { Subjects , Listener , ProductUpdatedEvent , BadRequestError } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/product.model";
import { queueGroupName } from "./queue-group-name";

export class ProductUpdatedListener extends Listener<ProductUpdatedEvent>
{
    readonly subject = Subjects.ProductUpdated;
    queueGroupName   = queueGroupName;

    async onMessage(data : ProductUpdatedEvent['data'] , msg : Message)
    {
        const product = await Product.findOne({ id : data.id , version : data.version - 1 });

        if(!product)
        {
            throw new BadRequestError('product not found!')
        }

        if(data.commentId && data.commentArrayLength)
        {
            if(product.comments.length > data.commentArrayLength)
            {
                product.comments = product.comments.filter(comment => comment !== data.commentId);
            }

            else
            {
                product.comments = [...product.comments , data.commentId];
            }
        }

        await product.save();
        
        msg.ack();
    };
};