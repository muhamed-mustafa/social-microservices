import { Subjects , Publisher , UserCreatedEvent } from "@social-microservices/common";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent>
{
    readonly subject = Subjects.UserCreated;
}