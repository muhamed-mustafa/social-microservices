import { Subjects , Publisher , UserUpdatedEvent } from "@social-microservices/common";

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent>
{
    readonly subject = Subjects.UserUpdated;
}