import { Password } from "../services/Password";
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { GenderType , CoverPicture , RolesType } from '@social-microservices/common';

interface UserAttrs 
{
    username : string;
    email : string;
    password : string;
    gender : GenderType;
    profilePicture? : string;
    coverPicture? : string;
    city? : string;
    description? : string;
    from? : string;
    roles? : RolesType;
    macAddress : { Mac : string }[];
    activeKey : string;
    active? : boolean;
    resetPasswordToken? : string;
    resetPasswordExpires? : string;
};
 
interface UserDoc extends mongoose.Document
{
    email : string;
    username : string;
    password : string;
    gender : GenderType;
    profilePicture : string;
    coverPicture : string;
    description : string;
    city : string;
    from : string;
    followers : [],
    following : [],
    roles : RolesType;
    version : number;
    macAddress : { Mac : string }[];
    ban : { id : string; period : string; reason : string; end_in : string }[];
    hasAccess : boolean;
    createdAt : string;
    updatedAt : string;
    activeKey : string;
    active : boolean;
    resetPasswordToken : string;
    resetPasswordExpires : string;
};

interface UserModel extends mongoose.Model<UserDoc>
{
    build(attrs : UserAttrs) : UserDoc;
}

const userSchema = new mongoose.Schema({
      username :
      {
          type : String,
          required : true,
          trim : true,
          unique : true,
          minlength : [8 , "Username must be more than 8 characters"],
          max : 20,
          lowercase : true
      },

      email :
      {
          type : String,
          required : true,
          trim : true,
          unique : true,
          max : 50,
          lowercase : true
      },

      password :
      {
          type : String,
          required : true,
          minlength : [8 , "Password must be more than 8 characters"]
      },

      gender :
      {            
          type : String,
          required : true,
          trim : true,
          lowercase : true,
          enum : Object.values(GenderType),
          default : ""
      },

      profilePicture :
      {
          type : String,
          default : "",
      },

      coverPicture : 
      {
        type: String,
        default: CoverPicture.Default
      },

      followers :
      {
          type : Array,
          default : []
      },

      following :
      {
          type : Array,
          default : []
      },

      description :
      {
          type : String,
          max  : 50, 
      },

      city :
      {
          type : String,
          max  : 50, 
      },

      from :
      {
          type : String,
          max  : 50, 
      },

      roles :
      {
        type: String,
        required: true,
        enum: Object.values(RolesType),
        default: RolesType.User
      },
      
      macAddress :
      {
          type : Array
      },

      hasAccess :
      {
            type : Boolean,
            default : true
      },

      ban :
      [
        {
            period :
            {
                type : String,
                trim : true
            },

            reason :
            {
                type : String,
                required : true,
                trim : true,
            },

            end_in :
            {
                type : String,
            }
        }
      ],
      
    activeKey :
    {
        type : String
    },

    active :
    {
        type    : Boolean ,
        default : false 
    },

    resetPasswordToken :
    {
        type : String ,
    }, 

    resetPasswordExpires : 
    {
        type : Date ,
    },

} , { toJSON : { transform(doc , ret) {ret.id = ret._id , delete ret._id , delete ret.password;
     ret.ban = ret.ban.map((data : any) => {
     const { period , reason , end_in , _id : id } = data;
     return { period , reason , end_in , id } }) } } ,
     timestamps : { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.set('versionKey' , 'version');
userSchema.plugin(updateIfCurrentPlugin);

userSchema.pre('save' , async function(done)
{
    if(this.isModified('password'))
    {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password' , hashed);
    };

    done();
});

userSchema.statics.build = (attrs : UserAttrs) =>
{
    return new User(attrs);
}

const User = mongoose.model<UserDoc , UserModel>('User' , userSchema);

export { User };
