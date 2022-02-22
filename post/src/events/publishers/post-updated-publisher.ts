import { Subjects , Publisher , PostUpdatedEvent } from "@social-microservices/common";

export class PostUpdatedPublisher extends Publisher<PostUpdatedEvent>
{
    readonly subject = Subjects.PostUpdated;
}