import { Publisher , Subjects , ProductUpdatedEvent } from "@social-microservices/common";

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent>
{
    readonly subject = Subjects.ProductUpdated;
}