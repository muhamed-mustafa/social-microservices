import { Subjects } from "./subjects";

export interface UnFollowCreatedEvent
{
    subject : Subjects.UserUnFollow;
    data :
    {
        follower : string;
        following : string;
        currentUserVersion : number;
        userVersion : number;
    };
};