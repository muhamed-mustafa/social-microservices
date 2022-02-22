import { Subjects } from "..";

export interface PostDeletedEvent
{
    subject : Subjects.PostDeleted;
    data :
    {
        id : string;
    };
};