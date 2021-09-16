import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    first_name: {
         type: String,
    },
    last_name: {
        type: String,
    },
    password: {
        type: String, 
        required: true, 
    },
    email: {
        type :String, 
        required: true, 
    },
    phonenumber: {
        type :String, 
    },
    codeStudent:{
        type :String, 
    },
    day_of_birth: {
        type: Number,
    },
    month_of_birth: {
        type: Number,
    },
    year_of_birth: {
        type: Number,
    },
    address: {
        type: String,
    },
    list_task:[{
        idTask:{
             type: String,
            index : true
        }
    }],
    gender: {
        type: String,
        enum: ["male", "female", "undefined"],
        default: "undefined",
    },
    role: {
        type: String,
        enum: ["student", "company", "trainingDepartment","undefined"],
        default: "undefined",
    },
    list_rate:[{
        rater_id:{
            type: String,
            index : true
        },
        id_task:{
            type:String,
        },
        rater_comment:{
            type: String,
        }
    }],
    status:{
        type: Number,
        default:0
    }
},{timestamps:true});
export const UserModel = mongoose.model("User", schema)