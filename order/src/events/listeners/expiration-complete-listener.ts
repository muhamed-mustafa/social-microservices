import { Message } from "node-nats-streaming";
import { Order , OrderStatus } from "../../models/order";
import { Listener , Subjects , ExpirationCompleteEvent } from "@social-microservices/common";
import { QueueGroupName } from "./queue-group-name";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>
{
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName   = QueueGroupName;

    async onMessage(data : ExpirationCompleteEvent['data'] , msg : Message)
    {
        const order = await Order.findById(data.orderId).populate('product');
        if(!order)
        {
            throw new Error('Order Not Found!');
        }

        if(order.status === OrderStatus.Complete)
        {
            return msg.ack();
        }

        order.set({ status : OrderStatus.Cancelled });
        await order.save();

        await new OrderCancelledPublisher(natsWrapper.client).publish({
          id : order.id,
          version : order.version,
          product :
          {
              id : order.product.id
          }
        });

        msg.ack();
    };
};