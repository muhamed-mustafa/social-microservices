import { Subjects } from "./subjects";

export interface ExpirationBanEvent
{
    subject : Subjects.ExpirationBan;
    data :
    {
        userId : string;
        banId  : string;
    };
};