import { Subjects , Publisher , UnFollowCreatedEvent } from "@social-microservices/common";

export class UnFollowCreatedPublisher extends Publisher<UnFollowCreatedEvent>
{
    readonly subject = Subjects.UserUnFollow;
};