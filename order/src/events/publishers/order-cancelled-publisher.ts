import { Subjects , OrderCancelledEvent , Publisher } from "@social-microservices/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>
{
    readonly subject = Subjects.OrderCancelled;
}
