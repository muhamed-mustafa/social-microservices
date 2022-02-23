import { Subjects } from "..";

export interface ProductDeletedEvent
{
    subject : Subjects.ProductDeleted;
    data :
    {
        id : string;
    };
};