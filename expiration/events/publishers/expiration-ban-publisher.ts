import { Subjects , ExpirationBanEvent , Publisher } from "@social-microservices/common";

export class ExpirationBanPublisher extends Publisher<ExpirationBanEvent>
{
    readonly subject = Subjects.ExpirationBan;
};