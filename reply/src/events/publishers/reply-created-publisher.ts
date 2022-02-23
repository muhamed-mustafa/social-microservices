import { Subjects , Publisher , ReplyCreatedEvent } from "@social-microservices/common";

export class ReplyCreatedPublisher extends Publisher<ReplyCreatedEvent>
{
    readonly subject = Subjects.ReplyCreated;
}