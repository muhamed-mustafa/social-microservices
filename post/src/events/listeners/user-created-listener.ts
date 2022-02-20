import { Subjects , Listener , UserCreatedEvent } from "@social-microservices/common";
import { User } from "../../models/user.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class UserCreatedListener extends Listener<UserCreatedEvent>
{
    readonly subject = Subjects.UserCreated;
    queueGroupName   = queueGroupName;
    async onMessage(data : UserCreatedEvent['data'] , msg : Message)
    {
        const user = User.build({
            id : data.id,
            email : data.email,
            username : data.username,
            profilePicture : data.profilePicture,
            coverPicture : data.coverPicture
        });

        await user.save();

        msg.ack();
    };
};