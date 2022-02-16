import { Subjects , Listener , OrderCreatedEvent } from "@social-microservices/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-order-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>
{
    readonly subject = Subjects.OrderCreated;
    queueGroupName   = queueGroupName;

    async onMessage(data : OrderCreatedEvent['data'] , msg : Message)
    {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Wiating this many millseconds to process the job ${delay}`);

        await expirationQueue.add({ orderId : data.id } , {delay});

        msg.ack();
    };
};