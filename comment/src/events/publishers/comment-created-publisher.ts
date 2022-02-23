import { Subjects , Publisher , CommentCreatedEvent } from "@social-microservices/common";

export class CommentCreatedPublisher extends Publisher<CommentCreatedEvent>
{
    readonly subject = Subjects.CommentCreated;
};