import { Subjects , Listener , ProductDeletedEvent , BadRequestError } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Product } from "../../models/product.model";
import { Comment } from "../../models/comment.model";
import { queueGroupName } from "./queue-group-name";

export class ProductDeletedListener extends Listener<ProductDeletedEvent>
{
    readonly subject = Subjects.ProductDeleted;
    queueGroupName   = queueGroupName;

    async onMessage(data : ProductDeletedEvent['data'] , msg : Message)
    {
        const product = await Product.findById(data.id);

        if(!product)
        {
            throw new BadRequestError('product not found!')
        }

        await Comment.deleteMany({ product : product.id });
                
        msg.ack();
    };
};