import mongoose from 'mongoose';

interface PostAttrs 
{
    userId  : string;
    images?  : { id : string , URL : string; }[];
    desc?   : string;
    likes?  : string[];
};

interface PostDoc extends mongoose.Document
{
    userId : string;
    images  : { id : string , URL : string; }[];
    desc   : string;
    likes  : string[];
    type   : string;
    createdAt : string;
    updatedAt : string;
};

interface PostModel extends mongoose.Model<PostDoc>
{
    build(attrs : PostAttrs) : PostDoc;
}

const postSchema = new mongoose.Schema({
  userId :
  {
      type : String,
      required : true,
  },

  images :
  {
      type : Array,
      default : [],
  },

  desc :
  {
      type : String,
      trim : true,
      max : 1000
  },

  likes :
  {
      type : Array,
      default : [],
  },

  type : 
  {
      type : String,
      default : "Post",
  },
 
} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id , delete ret.password } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false });

postSchema.statics.build = (attrs : PostAttrs) =>
{
    return new Post(attrs);
}

const Post = mongoose.model<PostDoc , PostModel>('Post' , postSchema);

export { Post };