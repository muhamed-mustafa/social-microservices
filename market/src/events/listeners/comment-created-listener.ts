import { Subjects , Listener , CommentCreatedEvent, BadRequestError } from "@social-microservices/common";
import { Product } from "../../models/product.model";
import { QueueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { ProductUpdatedPublisher } from "../publishers/product-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class CommentCreatedListener extends Listener<CommentCreatedEvent>
{
    readonly subject = Subjects.CommentCreated;
    queueGroupName   = QueueGroupName;
    async onMessage(data : CommentCreatedEvent['data'] , msg : Message)
    {
        if(data.productId)
        {
            let product = await Product.findById(data.productId);
            if(!product)
            {
                throw new BadRequestError('product not found');
            }

            product.comments = [...product.comments , data.id];

            let productData = await product.save();

            if(productData)
            {
                await new ProductUpdatedPublisher(natsWrapper.client).publish({
                  id : productData.id,
                  commentId : data.id,
                  version : productData.version,
                  commentArrayLength : productData.comments.length
                });
            }
        }

        msg.ack();
    };
};