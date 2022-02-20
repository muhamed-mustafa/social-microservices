import { Subjects } from "./subjects";

export interface FollowCreatedEvent
{
    subject : Subjects.UserFollow;
    data :
    {
        follower : string;
        following : string;
        currentUserVersion : number;
        userVersion : number;
    };
};