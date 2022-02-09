import mongoose from 'mongoose';
import { app } from './app';

const start = async () =>
{
   const Environment = ['MONGO_URI' ,  "JWT_KEY"];
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
   }

   catch(e)
   {
       console.log(e);
   }

   const PORT = 3000 || process.env.PORT;
   app.listen(PORT , () => console.log(`Server Listening On Port ${PORT} From Payment Service`));
}

start();