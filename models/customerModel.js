import mongoose from 'mongoose';
const customerSchema = new mongoose.Schema ({

    _id: ObjectId,

    personalInfo :{
    name:{type:String , required:true ,trim:true},
    cnic:{type:String , required:true , trim:true ,unique:true , index:true },
    phone:{type:String , required:true , trim:true, unique: true },
    email:{type:String , required:true, unique:true , trim:true , lowercase:true },
    hashPassword:{type:String , required:true},
    address:{type:String, required:true, trim:true},
    landmark:{type:String,required:true, trim:true},
    // createdAt:{type:Date, default: Date.now}
    CreatedAt:{timestamps:True}          // to auto add created at and updated at
    },
 
   documents: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      mimetype: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
});

const Customer = mongoose.model('Customer',customerSchema);

export default Customer;
