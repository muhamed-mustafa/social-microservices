import { Subjects , Listener , ExpirationBanEvent } from "@social-microservices/common";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user.model";
import { Message } from 'node-nats-streaming';

export class ExpirationBanListener extends Listener<ExpirationBanEvent>
{
    readonly subject = Subjects.ExpirationBan;
    queueGroupName   = queueGroupName;

    async onMessage(data : ExpirationBanEvent['data'] , msg : Message)
    {
        const user = await User.findById(data.userId);
        if(!user)
        {
            throw new Error('User is not found');
        }
        
        if(!user.ban.find(arr => arr.id === data.banId))
        {
            return msg.ack();
        }

        user.ban = user.ban.filter(arr => arr.id !== data.banId);

        if(user.ban.length === 0)
        {
            user.hasAccess = true;
        }
        
        await user.save();

        msg.ack();
    };
};
