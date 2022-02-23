import { Subjects , Listener , CommentCreatedEvent } from "@social-microservices/common";
import { Comment } from "../../models/comment.model";
import { Message } from "node-nats-streaming";
import { QueueGroupName } from "./queue-group-name";

export class CommentCreatedListener extends Listener<CommentCreatedEvent>
{
    readonly subject = Subjects.CommentCreated; 
    queueGroupName   = QueueGroupName;

    async onMessage(data : CommentCreatedEvent['data'] , msg : Message)
    {
        const comment = Comment.build({
          id : data.id,
          userId : data.userId,
          version : data.version,
          post : data.postId,
          product : data.productId
        });

        await comment.save();

        msg.ack();
    }
}