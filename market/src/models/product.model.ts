import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ProductAttrs 
{
    userId  : string;
    images? : { id : string , URL : string; }[];
    desc?   : string;
    likes?  : string[];
    price   : number;
};

interface ProductDoc extends mongoose.Document
{
    userId : string;
    images : { id : string , URL : string; }[];
    desc   : string;
    likes  : string[];
    type   : string;
    price  : number;
    createdAt : string;
    updatedAt : string;
};

interface ProductModel extends mongoose.Model<ProductDoc>
{
    build(attrs : ProductAttrs) : ProductDoc;
}

const productSchema = new mongoose.Schema({
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

  price :
  {
        type : Number,
        required : true,
        min : 0,
  },

  likes :
  {
      type : Array,
      default : [],
  },

  type : 
  {
      type : String,
      default : "Product",
  },
 
} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id , delete ret.password } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false });

productSchema.set('versionKey' , 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attrs : ProductAttrs) =>
{
    return new Product(attrs);
}

const Product = mongoose.model<ProductDoc , ProductModel>('Product' , productSchema);

export { Product };
