import { Subjects } from "..";

export interface PostCreatedEvent
{
    subject : Subjects.PostCreated;
    data :
    {
        id : string;
        author : string;
        version : number;
    };
};