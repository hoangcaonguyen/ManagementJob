import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name_job: {
      type: String,
    },
    task_owner_id: {
      type: String,
    },
    company_email: {
      type: String,
    },
    name_company: {
      type: String,
    },
    require_candidate: [
      {
        require: [],
        priorty: [],
      },
    ],
    benefits_enjoyed: [],
    
    task_description: [],
    
    type: {
      type: String,
      enum: ["intern", "official", "undefined"],
      default: "undefined",
    },
    location: {
      type: String,
      required: true,
    },
    position: {
      type: String,
    },
    expires: {
      type: String,
    },
    list_student_apply: [
      {
        idStudent: {
          type: String,
          index: true,
        },
        fullName: {
          type: String,
        },
        email: {
          type: String,
        },
        text: {
          type: String,
        },
        type_of_student: {
          type: Number,
        },
        experience: {
          type: Number,
        },
      },
    ],
    list_student_approve: [
      {
        idStudent: {
          type: String,
          index: true,
        },
        fullName: {
          type: String,
        },
        email: {
          type: String,
        },
      },
    ],
    list_student_pass_interview: [
      {
        idStudent: {
          type: String,
          index: true,
        },
        fullName: {
          type: String,
        },
        email: {
          type: String,
        },
      },
    ],
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
schema.index({
  task_owner_id: "text",
  company_email: "text",
  name_job: "text",
  price: "text",
  location: "text",
  name_company: "text",
});
export const TaskModel = mongoose.model("Task", schema);
