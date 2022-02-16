import { Subjects } from "./subjects";
import { OrderStatus } from "../types/order-status";

export interface OrderCreatedEvent
{
    subject : Subjects.OrderCreated;
    data :
    {
        id : string;
        buyerId : string;
        status : OrderStatus;
        version : number;
        expiresAt : string;
        product :
        {
            id : string;
            price : number;
        };
    };
};