import { Subjects } from "..";

export interface CommentDeletedEvent
{
    subject : Subjects.CommentDeleted;
    data :
    {
        id : string;
        postId? : string;
        productId? : string;
    };
};