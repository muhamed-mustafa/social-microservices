import { Publisher , Subjects , ProductCreatedEvent } from "@social-microservices/common";

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent>
{
    readonly subject = Subjects.ProductCreated;
}