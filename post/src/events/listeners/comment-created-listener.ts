import { Subjects , Listener , CommentCreatedEvent, BadRequestError } from "@social-microservices/common";
import { Post } from "../../models/post.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { PostUpdatedPublisher } from "../publishers/post-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class CommentCreatedListener extends Listener<CommentCreatedEvent>
{
    readonly subject = Subjects.CommentCreated;
    queueGroupName   = queueGroupName;
    async onMessage(data : CommentCreatedEvent['data'] , msg : Message)
    {
        if(data.postId)
        {
            let post = await Post.findById(data.postId);
            if(!post)
            {
                throw new BadRequestError('post not found');
            }

            post.comments = [...post.comments , data.id];

            let postData = await post.save();

            if(postData)
            {
                await new PostUpdatedPublisher(natsWrapper.client).publish({
                  id : postData.id,
                  commentId : data.id,
                  version : postData.version,
                  commentArrayLength : postData.comments.length
                });
            }
        }

        msg.ack();
    };
};