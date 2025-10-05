import mongoose from 'mongoose';
const subscriptionSchema = new mongoose.Schema ({

customer:{type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:true,   
},

package:{type:mongoose.Schema.Types.ObjectId,
        ref:'Package',
        required:true,
},

startdate:{type:Date,
        required:true,
        default:Date.now
},

enddate:{type:Date,
        required:true,
},

status:{type:String,
        enum:['active','expired','pending','suspended'],
        default:'pending',
},

autorenewal:{Type:Boolean,
        default:false,
},

renewalhistory:[{Type:Date,
       renewalDate:{type:Date},
       previousEndDate:{type:Date},
       newEndDate:{type:Date},
       renewedBy:{type:mongoose.Schema.Types.ObjectId, ref:'branchadmin'},
},        
],

},
{timestamps:true}
)

const CustomerSubscription = mongoose.model('CustomerSubscription', subscriptionSchema);
export default CustomerSubscription;