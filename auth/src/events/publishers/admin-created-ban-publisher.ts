import { Publisher , Subjects , AdminCreatedBanEvent } from "@social-microservices/common";

export class AdminCreatedBanPublisher extends Publisher<AdminCreatedBanEvent>
{
    readonly subject = Subjects.AdminCreatedBan;
}