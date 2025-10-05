import mongoose from 'mongoose';
const customerSchema = new mongoose.Schema ({

    _id: ObjectId,

    PersonalInfo :{
    name:{type:String , required:true ,trim:true},
    CNIC:{type:String , required:true , trim:true ,unique:true , index:true },
    phone:{type:String , required:true , trim:true, unique: true },
    email:{type:String , required:true, unique:true , trim:true , lowercase:true },
    hashPassword:{type:String , required:true},
    address:{type:String, required:true, trim:true},
    landmark:{type:String,required:true, trim:true},
    createdAt:{type:Date, default: Date.now}

    }
 })

 export default customerSchema;
