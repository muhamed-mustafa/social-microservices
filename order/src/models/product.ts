import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order , OrderStatus } from './order';

interface ProductAttrs 
{
    id : string;
    images? : { id : string , URL : string; }[];
    content?   : string;
    price   : number;
};

export interface ProductDoc extends mongoose.Document
{
    id : string;
    images : { id : string , URL : string; }[];
    content   : string;
    type   : string;
    price  : number;
    version : number;
    isReserved() : Promise<boolean>;
};

interface ProductModel extends mongoose.Model<ProductDoc>
{
    build(attrs : ProductAttrs) : ProductDoc;
    findByEvent(event : { id : string , version : number}) : Promise<ProductDoc | null>;
}

const productSchema = new mongoose.Schema({
 
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

  type : 
  {
      type : String,
      default : "Product",
  },
 
} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id  } } , timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } , versionKey : false });

productSchema.set('versionKey' , 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.methods.isReserved = async function()
{
    const existingOrder = await Order.findOne({
      product : this,
      status :
      {
          $in :
          [
              OrderStatus.Created,
              OrderStatus.AwaitingPayment,
              OrderStatus.Complete
          ],
      },
    });

    return !!existingOrder; 
};

productSchema.statics.findByEvent = (event : { id : string , version : number}) =>
{
    return Product.findOne({ id : event.id , version : event.version - 1});
};

productSchema.statics.build = (attrs : ProductAttrs) =>
{
    return new Product({
        _id : attrs.id,
        ...attrs
    });
}

const Product = mongoose.model<ProductDoc , ProductModel>('Product' , productSchema);

export { Product };
