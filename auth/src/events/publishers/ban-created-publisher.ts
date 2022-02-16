import { Publisher , Subjects , BanCreatedEvent } from "@social-microservices/common";

export class BanCreatedPublisher extends Publisher<BanCreatedEvent>
{
    readonly subject = Subjects.ExpirationBan;
}