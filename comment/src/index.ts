import mongoose from 'mongoose';
import { v2 as Cloudinary } from 'cloudinary';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { PostCreatedListener } from './events/listeners/post-created-listener';
import { PostUpdatedListener } from './events/listeners/post-updated.listener';
import { PostDeletedListener } from './events/listeners/post-deleted-listener';
import { ProductCreatedListener } from './events/listeners/product-created-listener';
import { ProductUpdatedListener } from './events/listeners/product-updated-listener';
import { ProductDeletedListener } from './events/listeners/product-deleted-listener';
import { ReplyCreatedListener } from './events/listeners/reply-created-listener';
import { ReplyDeletedListener } from './events/listeners/reply-deleted-listener';

const start = async () =>
{
   const Environment = ['MONGO_URI' ,  "JWT_KEY" , "CLOUDINARY_NAME" , "CLOUDINARY_API_KEY" , "CLOUDINARY_SECRET_KEY" , 'NATS_CLUSTER_ID' , 'NATS_URL' , 'NATS_CLIENT_ID'];
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

        new PostCreatedListener(natsWrapper.client).listen();
        new PostUpdatedListener(natsWrapper.client).listen();
        new PostDeletedListener(natsWrapper.client).listen();

        new ProductCreatedListener(natsWrapper.client).listen();
        new ProductUpdatedListener(natsWrapper.client).listen();
        new ProductDeletedListener(natsWrapper.client).listen();

        new ReplyCreatedListener(natsWrapper.client).listen();
        new ReplyDeletedListener(natsWrapper.client).listen();
        
        await mongoose.connect(process.env.MONGO_URI! , { useNewUrlParser : true , useUnifiedTopology : true } as mongoose.ConnectOptions);
        mongoose.Promise = global.Promise;
        console.log('Connection to Mongodb Successfully!');
        
        await Cloudinary.config({
          cloud_name : process.env.CLOUDINARY_NAME,
          api_key    : process.env.CLOUDINARY_API_KEY,
          api_secret : process.env.CLOUDINARY_SECRET_KEY
        });
   }

   catch(e)
   {
       console.log(e);
   }

   const PORT = 3000 || process.env.PORT;
   app.listen(PORT , () => console.log(`Server Listening On Port ${PORT} From Comment Service`));
}

start();