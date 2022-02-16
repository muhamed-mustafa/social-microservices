import { Subjects , OrderCreatedEvent , Publisher } from "@social-microservices/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>
{
    readonly subject = Subjects.OrderCreated;
}
