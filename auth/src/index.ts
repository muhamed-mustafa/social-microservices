import mongoose from 'mongoose';
import { v2 as Cloudinary } from 'cloudinary';
import { app } from './app';

const start = async () =>
{
   const Environment = ['MONGO_URI' ,  "JWT_KEY" , "CLOUDINARY_NAME" , "CLOUDINARY_API_KEY" , "CLOUDINARY_SECRET_KEY"];
   Environment.forEach(el =>
   {
      if(!process.env[el])
      {
          throw new Error(`${el} Must Be Defined`)
      }
   });

   try
   {
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
   app.listen(PORT , () => console.log(`Server Listening On Port ${PORT} From Auth Service`));
}

start();