import { Subjects , Publisher , FollowCreatedEvent } from "@social-microservices/common";

export class FollowCreatedPublisher extends Publisher<FollowCreatedEvent>
{
    readonly subject = Subjects.UserFollow;
};