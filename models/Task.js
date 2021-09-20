import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    task_title: {
         type: String,
    },
    task_owner_id: {
        type: String,
    },
    task_owner_first_name: {
        type: String, 
        required: true, 
    },
    task_owner_last_name: {
        type :String, 
        required: true, 
    },
    task_description:{
        type :String, 
        required: true, 
    },
    price: {
        type :Number, 
        required: true, 
    },
    type: {
        type: String,
        enum: ["intern", "official","undefined"],
        default: "undefined",
    },
    location:{
        type :String, 
        required: true,
    }, 
    position: {
        type :String, 
    },
    list_student_apply:[{
        idStudent:{
            type: String,
            index : true
        },
         first_name:{
            type: String,
        },
        last_name:{
            type: String,
        },
        text:{
            type: String,
        }
    }],
    list_student_approve:[{
        idStudent:{
            type: String,
            index : true
        },
        first_name:{
            type: String,
        },
        last_name:{
            type: String,
        }
    }],
    list_student_pass_interview:[{
        idStudent:{
            type: String,
            index : true
        },
        first_name:{
            type: String,
        },
        last_name:{
            type: String,
        }
    }],
    status:{
        type: Number,
        default:0
    }
},{timestamps:true});
schema.index(
    {
        task_owner_first_name : "text",
        task_owner_last_name : "text",
        task_title:"text",
        price : "text",
        location : "text",
    }
);
export const TaskModel = mongoose.model("Task", schema)