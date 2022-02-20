import { Subjects , Publisher , UserDeletedEvent } from "@social-microservices/common";

export class UserDeletedPublisher extends Publisher<UserDeletedEvent>
{
    readonly subject = Subjects.UserDeleted;
}