import { Subjects } from "./subjects";

export interface BanCreatedEvent
{
    subject : Subjects.ExpirationBan;
    data :
    {
        id : string;
        ban :
        {
            id : string;
            end_in? : string;
        }
    };
};