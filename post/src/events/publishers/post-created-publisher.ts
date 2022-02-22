import { Subjects , Publisher , PostCreatedEvent } from "@social-microservices/common";

export class PostCreatedPublisher extends Publisher<PostCreatedEvent>
{
    readonly subject = Subjects.PostCreated;
}