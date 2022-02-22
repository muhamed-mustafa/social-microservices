import { ModelType } from '@social-microservices/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ProductAttrs 
{
    merchantId  : string;
    images? : { id : string , URL : string; }[];
    content?   : string;
    likes?  : string[];
    price   : number;
};

interface ProductDoc extends mongoose.Document
{
    merchantId : string;
    images : { id : string , URL : string; }[];
    content   : string;
    likes  : string[];
    type   : string;
    price  : number;
    version : number;
    createdAt : string;
    updatedAt : string;
    orderId?  : string;
    comments  : string[]; 
};

interface ProductModel extends mongoose.Model<ProductDoc>
{
    build(attrs : ProductAttrs) : ProductDoc;
}

const productSchema = new mongoose.Schema({
  merchantId :
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
      default : ModelType.Product,
  },

  orderId :
  {
      type : String,
  },

  comments :
  {
      type : Array,
      default : []
  }
 
} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id , delete ret.password } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false });

productSchema.set('versionKey' , 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attrs : ProductAttrs) =>
{
    return new Product(attrs);
}

const Product = mongoose.model<ProductDoc , ProductModel>('Product' , productSchema);

export { Product };
