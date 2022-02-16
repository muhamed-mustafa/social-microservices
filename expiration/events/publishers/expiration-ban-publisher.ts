import { Subjects , BanCreatedEvent , Publisher } from "@social-microservices/common";

export class ExpirationBanPublisher extends Publisher<BanCreatedEvent>
{
    readonly subject = Subjects.ExpirationBan;
};