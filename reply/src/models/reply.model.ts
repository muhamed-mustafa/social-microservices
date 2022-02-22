import mongoose from 'mongoose';

interface ReplyAttrs
{
    userId : string;
    comment : string;
    content? : string;
    media? : { id : string; URL : string}[];
};

interface ReplyDoc extends mongoose.Document
{
    userId : string;
    comment : string;
    content : string;
    media   : { id : string; URL : string}[];
    created_at : string;
    updated_at : string;
};

interface ReplyModel extends mongoose.Model<ReplyDoc>
{
    build(attrs : ReplyAttrs) : ReplyDoc;
}

const replySchema = new mongoose.Schema({
  
  userId : 
  {
      type : String,
      required : true
  },

  content :
  {
      type : String,
      trim : true,
      min  : 1
  },

  comment :
  {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Comment"
  },

  media :
  {
      type : Array,
      default : []
  }

} , {toJSON : { transform(doc , ret) { ret.id = ret._id , delete ret._id } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false});

replySchema.statics.build = (attrs : ReplyAttrs) =>
{
    return new Reply({ ...attrs });
};

const Reply = mongoose.model<ReplyDoc , ReplyModel>('Reply' , replySchema);

export { Reply };