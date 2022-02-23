import { Subjects , Listener , CommentDeletedEvent, BadRequestError } from "@social-microservices/common";
import { Post } from "../../models/post.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { PostUpdatedPublisher } from "../publishers/post-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class CommentDeletedListener extends Listener<CommentDeletedEvent>
{
    readonly subject = Subjects.CommentDeleted;
    queueGroupName   = queueGroupName;
    async onMessage(data : CommentDeletedEvent['data'] , msg : Message)
    {
        if(data.postId)
        {
            let post = await Post.findById(data.postId);
            if(!post)
            {
                throw new BadRequestError('post not found');
            }

            post.comments = post.comments.filter(comment => comment !== data.id)

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