import { Subjects } from "./subjects";

export interface AdminCreatedBanEvent
{
    subject : Subjects.AdminCreatedBan;
    data :
    {
        id : string;
        ban :
        {
            id : string;
            end_in? : string;
        }
    }
};