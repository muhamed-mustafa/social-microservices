import { Subjects } from "..";

export interface ReplyCreatedEvent
{
    subject : Subjects.ReplyCreated;
    data :
    {
        id : string;
        commentId : string;
    };
};