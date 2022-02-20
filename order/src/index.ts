import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { ProductCreatedListener } from './events/listeners/product-created-listener';
import { ProductUpdatedListener } from './events/listeners/product-updated-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';

const start = async () =>
{
   const Environment = ['MONGO_URI' ,'NATS_URL' ,'NATS_CLIENT_ID' ,'NATS_CLUSTER_ID'];
   Environment.forEach(el =>
   {
      if(!process.env[el])
      {
          throw new Error(`${el} Must Be Defined`)
      }
   });

   try
   {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID! , process.env.NATS_CLIENT_ID! , process.env.NATS_URL!);
        natsWrapper.client.on('close' , () =>
        {
            console.log('Nats Connection Closed!');
            process.exit();
        });

        process.on('SIGINT' , () => natsWrapper.client.close());
        process.on('SIGTERM' , () => natsWrapper.client.close());

        new ProductCreatedListener(natsWrapper.client).listen();
        new ProductUpdatedListener(natsWrapper.client).listen();
        
        new PaymentCreatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        
        await mongoose.connect(process.env.MONGO_URI! , { useNewUrlParser : true , useUnifiedTopology : true } as mongoose.ConnectOptions);
        mongoose.Promise = global.Promise;
        console.log('Connection to Mongodb Successfully!');
   }

   catch(e)
   {
       console.log(e);
   }

   const PORT = 3000 || process.env.PORT;
   app.listen(PORT , () => console.log(`Server Listening On Port ${PORT} From Order Service`));
}

start();