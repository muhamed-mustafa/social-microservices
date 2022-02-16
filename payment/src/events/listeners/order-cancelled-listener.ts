import { Subjects , OrderCancelledEvent , Listener, OrderStatus } from "@social-microservices/common";
import { Order } from "../../models/order.model";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>
{
    readonly subject = Subjects.OrderCancelled;
    queueGroupName   = queueGroupName;

    async onMessage(data : OrderCancelledEvent['data'] , msg : Message)
    {
        let order = await Order.findOne({ id : data.id , version : data.version - 1 });
        if(!order)
        {
          throw new Error('Order Not Found!');
        }

        order.set({ status : OrderStatus.Cancelled });
        await order.save();
        
        msg.ack();
    };
};