import { Subjects } from "..";

export interface CommentCreatedEvent
{
    subject : Subjects.CommentCreated;
    data :
    {
        id : string;
        userId : string;
        postId? : string;
        productId? : string;
        version : number;
    };
};