import { Subjects , Listener , PostUpdatedEvent, BadRequestError } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Post } from "../../models/post.model";
import { queueGroupName } from "./queue-group-name";

export class PostUpdatedListener extends Listener<PostUpdatedEvent>
{
    readonly subject = Subjects.PostUpdated;
    queueGroupName   = queueGroupName;

    async onMessage(data : PostUpdatedEvent['data'] , msg : Message)
    {
        const post = await Post.findOne({ id : data.id , version : data.version - 1});

        if(!post)
        {
            throw new BadRequestError('post not found!');
        }

        if(data.commentId && data.commentArrayLength)
        {
            if(post.comments.length > Number(data.commentArrayLength))
            {
                post.comments = post.comments.filter(comment => comment !== data.commentId)
            }

            else
            {
                post.comments = [...post.comments , data.commentId]
            }
        }

        await post.save();

        msg.ack();
    };
};