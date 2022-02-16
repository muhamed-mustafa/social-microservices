import { Subjects , OrderCreatedEvent , Listener } from "@social-microservices/common";
import { Order } from "../../models/order.model";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>
{
    readonly subject = Subjects.OrderCreated;
    queueGroupName   = queueGroupName;

    async onMessage(data : OrderCreatedEvent['data'] , msg : Message)
    {
        const order = Order.build({
          id : data.id,
          status : data.status,
          buyerId : data.buyerId,
          version : data.version,
          price : data.product.price
        });

        await order.save();

        msg.ack();
    };
};