import mongoose from 'mongoose';
import { OrderStatus } from '@social-microservices/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs 
{
    id : string;
    buyerId  : string;
    status  : OrderStatus;
    version : number;
    price   : number;
}

interface OrderDoc extends mongoose.Document
{
    buyerId  : string;
    status  : OrderStatus;
    version : number;
    price   : number;
}

interface OrderModel extends mongoose.Model<OrderDoc>
{
    build(attrs : OrderAttrs) : OrderDoc;
}

const orderSchema = new mongoose.Schema({

    buyerId :
    {
        type : String,
        required : true
    },

    status :
    {
        type : String,
        required : true,
    },

    price :
    {
        type : Number,
        required : true
    }

} , {toJSON : { transform(doc , ret) { ret.id = ret._id , delete ret._id } }});

orderSchema.set('versionKey' , 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs : OrderAttrs) =>
{
    return new Order({
      _id : attrs.id,
      ...attrs
    });
}

const Order = mongoose.model<OrderDoc , OrderModel>('Order' , orderSchema);

export { Order };