import { Subjects , Publisher , PostDeletedEvent } from "@social-microservices/common";

export class PostDeletedPublisher extends Publisher<PostDeletedEvent>
{
    readonly subject = Subjects.PostDeleted;
}