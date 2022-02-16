import { Subjects , PaymentCreatedEvent , Publisher } from "@social-microservices/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>
{
    readonly subject = Subjects.PaymentCreated;
};