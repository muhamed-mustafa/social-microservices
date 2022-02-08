import mongoose from 'mongoose';
import { OrderStatus } from '@social-microservices/common';
import { ProductDoc } from './product';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs 
{
    userId : string;
    status : OrderStatus;
    expiresAt : string;
    product : ProductDoc;
}

interface OrderDoc extends mongoose.Document
{
    userId : string;
    status : OrderStatus;
    expiresAt : string;
    product : ProductDoc;
    version : number;
}

interface OrderModel extends mongoose.Model<OrderDoc>
{
    build(attrs : OrderAttrs) : OrderDoc;
}

const orderSchema = new mongoose.Schema({

    userId :
    {
        type : String,
        required : true
    },

    status :
    {
        type : String,
        required : true,
        enum : Object.values(OrderStatus),
        default : OrderStatus.Created
    },

    expiresAt :
    {
        type : String,
    },

    product :
    {
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'Product' 
    }

} , {toJSON : {transform(doc , ret) { ret.id = doc._id , delete ret._id } }});

orderSchema.set('versionKey' , 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs : OrderAttrs) =>
{
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc , OrderModel>('Order' , orderSchema);

export { Order  , OrderStatus };