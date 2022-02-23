import { Subjects , Publisher , ReplyDeletedEvent } from "@social-microservices/common";

export class ReplyDeletedPublisher extends Publisher<ReplyDeletedEvent>
{
    readonly subject = Subjects.ReplyDeleted;
}