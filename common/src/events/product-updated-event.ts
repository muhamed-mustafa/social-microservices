import { Subjects } from "./subjects";

export interface ProductUpdatedEvent
{
    subject : Subjects.ProductUpdated;
    data :
    {
        id : string;
        merchantId? : string;
        images? : { id : string , URL : string; }[];
        content?   : string;
        price?  : number;
        commentId? : string;
        commentArrayLength? : number;
        version : number;
        orderId? : string;
    };
};