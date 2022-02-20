import { Subjects , Listener , UserDeletedEvent } from "@social-microservices/common";
import { User } from "../../models/user.model";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class UserDeletedListener extends Listener<UserDeletedEvent>
{
    readonly subject = Subjects.UserDeleted;
    queueGroupName   = queueGroupName;
    async onMessage(data : UserDeletedEvent['data'] , msg : Message)
    {
        const user = await User.findByIdAndRemove(data.id);

        if(!user)
        {
            throw new Error('user is not found.')
        }
        
        msg.ack();
    };
};