import { Subjects , Listener , CommentDeletedEvent, BadRequestError } from "@social-microservices/common";
import { Comment } from "../../models/comment.model";
import { Message } from "node-nats-streaming";
import { QueueGroupName } from "./queue-group-name";
import { Reply } from "../../models/reply.model";

export class CommentDeletedListener extends Listener<CommentDeletedEvent>
{
    readonly subject = Subjects.CommentDeleted; 
    queueGroupName   = QueueGroupName;

    async onMessage(data : CommentDeletedEvent['data'] , msg : Message)
    {
        const comment = await Comment.findByIdAndDelete(data.id)

        if(!comment)
        {
            throw new BadRequestError('comment not found');
        }

        await Reply.deleteMany({ comment : comment.id });

        msg.ack();
    }
}