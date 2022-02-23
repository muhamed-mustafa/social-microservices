import { Subjects , Publisher , CommentDeletedEvent } from "@social-microservices/common";

export class CommentDeletedPublisher extends Publisher<CommentDeletedEvent>
{
    readonly subject = Subjects.CommentDeleted;
};