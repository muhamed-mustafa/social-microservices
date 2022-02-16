import { Subjects , Listener , BanCreatedEvent } from "@social-microservices/common";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user.model";
import { Message } from 'node-nats-streaming';

export class ExpirationBanListener extends Listener<BanCreatedEvent>
{
    readonly subject = Subjects.ExpirationBan;
    queueGroupName   = queueGroupName;

    async onMessage(data : BanCreatedEvent['data'] , msg : Message)
    {
        const user = await User.findById(data.id);
        if(!user)
        {
            throw new Error('User is not found');
        }

        user.ban = user.ban.filter(arr => arr.id !== data.ban.id);

        await user.save();

        msg.ack();
    };
};
