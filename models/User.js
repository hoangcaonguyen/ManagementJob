import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    name_company: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
    },
    type_of_student: {
      type: String,
    },
    name_Hr: {
      type: String,
    },
    birthday: {
      type: String,
    },
    company_summary: {
      type: String,
    },
    title_job: {
      type: String,
    },
    additional_info: {
      type: String,
    },
    certification: {
      type: String,
    },
    experience: {
      type: String,
    },
    objective: {
      type: String,
    },
    skills: {
      type: String,
    },
    major: {
      type: String,
    },
    name_of_school: {
      type: String,
    },
    address: {
      type: String,
    },
    list_task: [
      {
        idTask: {
          type: String,
          index: true,
        },
      },
    ],
    gender: {
      type: String,
      enum: ["male", "female", "undefined"],
      default: "undefined",
    },
    role: {
      type: String,
      enum: ["student", "company", "trainingDepartment", "admin", "undefined"],
      default: "undefined",
    },
    list_rate: [
      {
        rater_id: {
          type: String,
          index: true,
        },
        id_task: {
          type: String,
        },
        rater_comment: {
          type: String,
        },
      },
    ],
    codeVerify: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
schema.index({
  first_name: "text",
  last_name: "text",
  email: "text",
  fullName: "text",
  address: "text",
});
export const UserModel = mongoose.model("User", schema);
