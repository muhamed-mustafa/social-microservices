import Queue from "bull";
import { ExpirationBanPublisher } from "../events/publishers/expiration-ban-publisher";
import { natsWrapper } from '../src/nats-wrapper'; 

interface payload
{
    userId : string;
    banId  : string;
};

const expirationQueue = new Queue<payload>('ban-expiration' , 
{
    redis :
    {
        host : process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) =>
{
    new ExpirationBanPublisher(natsWrapper.client).publish({
        userId : job.data.userId,
        banId  : job.data.banId
    });
});

export { expirationQueue };