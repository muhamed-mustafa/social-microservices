import { Subjects , Listener , CommentUpdatedEvent, BadRequestError } from "@social-microservices/common";
import { Comment } from "../../models/comment.model";
import { Message } from "node-nats-streaming";
import { QueueGroupName } from "./queue-group-name";

export class CommentUpdatedListener extends Listener<CommentUpdatedEvent>
{
    readonly subject = Subjects.CommentUpdated; 
    queueGroupName   = QueueGroupName;

    async onMessage(data : CommentUpdatedEvent['data'] , msg : Message)
    {
        const comment = await Comment.findOne({ id : data.id , version : data.version });

        if(!comment)
        {
            throw new BadRequestError('comment not found');
        }

        if(comment.replies.length > Number(data.replyArrayLength))
        {
            comment.replies = comment.replies.filter(reply => reply !== data.replyId);
        }

        else
        {
            comment.replies.push(String(data.replyId));
        }

        await comment.save();

        msg.ack();
    }
}