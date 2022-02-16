import { Subjects , Listener , BanCreatedEvent } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-ban-queue";

export class BanCreatedListener extends Listener<BanCreatedEvent>
{
    readonly subject = Subjects.ExpirationBan;
    queueGroupName   = queueGroupName;

    async onMessage(data : BanCreatedEvent['data'] , msg : Message)
    {
        const delay = new Date(String(data.ban.end_in)).getTime() - new Date().getTime();

        expirationQueue.add({ userId : data.id , banId : data.ban.id } , { delay });

        msg.ack();
    };
};