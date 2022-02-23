import { Subjects , Listener , ReplyCreatedEvent, BadRequestError } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Comment } from "../../models/comment.model";
import { CommentUpdatedPublisher } from "../publishers/comment-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class ReplyCreatedListener extends Listener<ReplyCreatedEvent>
{
    readonly subject = Subjects.ReplyCreated;
    queueGroupName   = queueGroupName;

    async onMessage(data : ReplyCreatedEvent['data'] , msg : Message)
    {
        const comment = await Comment.findById(data.commentId);

        if(!comment)
        {
            throw new BadRequestError('comment not found!');
        }

        comment.replies.push(data.id);

        await comment.save();

        new CommentUpdatedPublisher(natsWrapper.client).publish({
            id : comment.id,
            version : comment.version,
            replyId : data.id,
            replyArrayLength : comment.replies.length
        });

        msg.ack();
    };
};