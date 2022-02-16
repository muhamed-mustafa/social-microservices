import { Subjects } from "./subjects";

export interface ProductCreatedEvent
{
    subject : Subjects.ProductCreated;
    data :
    {
        id : string;
        merchantId : string;
        images : { id : string , URL : string; }[];
        content   : string;
        price  : number;
        version : number;
    };
};