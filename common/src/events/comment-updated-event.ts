import { Subjects } from "..";

export interface CommentUpdatedEvent
{
    subject : Subjects.CommentUpdated;
    data :
    {
        id : string;
        replyId? : string;
        replyArrayLength? : number;
        version : number;
    };
};