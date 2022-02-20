import { Subjects } from "./subjects";

export interface UserUpdatedEvent
{
    subject : Subjects.UserUpdated;
    data :
    {
        id : string;
        email? : string;
        username? : string;
        profilePicture? : string;
        coverPicture? : string;
        version : number;
    };
};