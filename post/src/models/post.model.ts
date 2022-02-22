import mongoose from 'mongoose';
import { ModelType } from '@social-microservices/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface PostAttrs 
{
    author  : string;
    images? : { id : string , URL : string; }[];
    content?   : string;
    likes?  : string[];
};

interface PostDoc extends mongoose.Document
{
    author : string;
    images : { id : string , URL : string; }[];
    content   : string;
    likes  : string[];
    type   : string;
    version : number;
    createdAt : string;
    updatedAt : string;
    comments  : string[];
};

interface PostModel extends mongoose.Model<PostDoc>
{
    build(attrs : PostAttrs) : PostDoc;
}

const postSchema = new mongoose.Schema({
  author :
  {
      type : String,
      required : true,
  },

  images :
  {
      type : Array,
      default : [],
  },

  content :
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
      default : ModelType.Post,
  },

  comments :
  {
      type : Array,
      default : []
  }
 
} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false });

postSchema.statics.build = (attrs : PostAttrs) =>
{
    return new Post(attrs);
}

postSchema.set('versionKey' , 'version');
postSchema.plugin(updateIfCurrentPlugin);

const Post = mongoose.model<PostDoc , PostModel>('Post' , postSchema);

export { Post };


