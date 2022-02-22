import { Subjects , Listener , PostDeletedEvent, BadRequestError } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Post } from "../../models/post.model";
import { queueGroupName } from "./queue-group-name";
import { Comment } from "../../models/comment.model";

export class PostDeletedListener extends Listener<PostDeletedEvent>
{
    readonly subject = Subjects.PostDeleted;
    queueGroupName   = queueGroupName;

    async onMessage(data : PostDeletedEvent['data'] , msg : Message)
    {
        const post = await Post.findByIdAndDelete(data.id);
        if(!post)
        {
            throw new BadRequestError('post not found!');
        }

        await Comment.deleteMany({ post : post.id });

        msg.ack();
    };
};