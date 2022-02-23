import { Subjects } from "..";

export interface ReplyDeletedEvent
{
    subject : Subjects.ReplyDeleted;
    data :
    {
        id : string;
        commentId : string;
    };
};