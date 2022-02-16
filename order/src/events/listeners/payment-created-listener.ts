import { Message } from "node-nats-streaming"; 
import { Subjects , PaymentCreatedEvent , Listener, OrderStatus } from "@social-microservices/common";
import { Order } from "../../models/order";
import { QueueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>
{
    readonly subject = Subjects.PaymentCreated;
    queueGroupName   = QueueGroupName;
    
    async onMessage(data : PaymentCreatedEvent['data'] , msg : Message)
    {
        const order = await Order.findById(data.orderId);
        if(!order)
        {
          throw new Error('Order Not Found!');
        }

        order.set({ status : OrderStatus.Complete });
        await order.save();

        msg.ack()
    };
};