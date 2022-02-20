import { Subjects , Listener , AdminCreatedBanEvent } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-ban-queue";

export class AdminCreatedBanListener extends Listener<AdminCreatedBanEvent>
{
    readonly subject = Subjects.AdminCreatedBan;
    queueGroupName   = queueGroupName;

    async onMessage(data : AdminCreatedBanEvent['data'] , msg : Message)
    {
        const delay = new Date(String(data.ban.end_in)).getTime() - new Date().getTime();

        expirationQueue.add({ userId : data.id , banId : data.ban.id } , { delay });

        msg.ack();
    };
};