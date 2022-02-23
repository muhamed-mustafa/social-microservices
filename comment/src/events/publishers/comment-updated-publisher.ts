import { Subjects , Publisher , CommentUpdatedEvent } from "@social-microservices/common";

export class CommentUpdatedPublisher extends Publisher<CommentUpdatedEvent>
{
    readonly subject = Subjects.CommentUpdated;
};