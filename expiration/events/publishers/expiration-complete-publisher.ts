import { Subjects , ExpirationCompleteEvent , Publisher } from "@social-microservices/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>
{
    readonly subject = Subjects.ExpirationComplete;
};