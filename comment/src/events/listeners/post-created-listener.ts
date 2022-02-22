import { Subjects , Listener , PostCreatedEvent } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { Post } from "../../models/post.model";
import { queueGroupName } from "./queue-group-name";

export class PostCreatedListener extends Listener<PostCreatedEvent>
{
    readonly subject = Subjects.PostCreated;
    queueGroupName   = queueGroupName;

    async onMessage(data : PostCreatedEvent['data'] , msg : Message)
    {
        const post = Post.build({ id : data.id , author : data.author , version : data.version});

        await post.save();

        msg.ack();
    };
};