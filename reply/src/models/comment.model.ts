import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CommentAttrs
{
    id : string;
    userId : string;
    post? : string;
    product? : string;
};

interface CommentDoc extends mongoose.Document
{
    userId : string;
    post   : string;
    product : string;
    replies : string[];
    version : number;
    created_at : string;
    updated_at : string;
};

interface CommentModel extends mongoose.Model<CommentDoc>
{
    build(attrs : CommentAttrs) : CommentDoc;
}

const commentSchema = new mongoose.Schema({
  
  userId : 
  {
      type : String,
      required : true
  },

  post :
  {
      type : String,
  },

  product :
  {
      type : String,
  },


  replies :
  [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Reply"
      }
  ]

} , {toJSON : { transform(doc , ret) { ret.id = ret._id , delete ret._id } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' }})

commentSchema.set('versionKey' , 'version');
commentSchema.plugin(updateIfCurrentPlugin);

commentSchema.statics.build = (attrs : CommentAttrs) =>
{
    return new Comment({ ...attrs });
};

const Comment = mongoose.model<CommentDoc , CommentModel>('Comment' , commentSchema);

export { Comment };