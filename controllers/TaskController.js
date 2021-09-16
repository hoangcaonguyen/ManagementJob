import {TaskModel}  from "../models/Task.js";
import {UserModel}  from "../models/User.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";

//get all task
export const getTaskActive = async (req, res) => {
  try {
      const listTask = await TaskModel.find({"status":1});
      res.status(200).json(listTask);
  } catch (e) {
      console.log(e);
  }
};

export const getNumberStudentApply = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
    });
    const matched = await v.check();
    if(matched){
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err,decoded) => {
          if(err){
            res.status(500).json({ error: err });
          }
          if(decoded){
            console.log(decoded);
            if(decoded.role == "trainingDepartment"){
                 var result = await TaskModel.findOne(
                        {
                            _id: req.body.idTask 
                        },
                        "list_student_apply"
                        );
                        console.log(result.list_student_apply.length);
                        if(result.list_student_apply.length>=0){
                            res.status(200).json({status:true,data:result.list_student_apply.length});
                        } else {
                            res.status(500).json({ error: "Thất bại" });
                        }         
                } else {
                    res.status(500).json({ error: "Không đúng vai trò" });
                }           
            }
        }
      )
    }else{
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
//ntd post task
export const postTask = async (req, res) => {
 
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      task_title: "required|maxLength:50",
      task_description: "required",
      price:"required",
      location:"required"
    });
    const matched = await v.check();
    if (matched) {
         jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err,decoded) => {
          if(err){
            res.status(500).json({ error: err });
          }
          if(decoded){
            if(decoded.role == "company"){
                   const task = new TaskModel({
                        task_title: req.body.task_title,
                        task_owner_id: decoded._id,
                        task_owner_first_name: decoded.first_name,
                        task_owner_last_name: decoded.last_name,
                        task_description: req.body.task_description,
                        price:req.body.price,
                        location:req.body.location
                    });
        
                    await task.save(function (err) {
                    if (err) {
                        res.status(500).json({ errors: err });
                    } else {
                        res.status(200).json({ success: true, data: task });
                    }
                    });      
                } else {
                    res.status(500).json({ error: "Không đúng vai trò" });
                }           
            }
        }
      )
       
    } else {
      res.status(500).json({ errors: v.errors });
    }
  } catch (err) {
    res.status(500).json({ errors: err });
  }
};
//confirm post task
export const confirmTask = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
    });
    const matched = await v.check();
    if(matched){
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err,decoded) => {
          if(err){
            res.status(500).json({ error: err });
          }
          if(decoded){
            console.log(decoded);
            if(decoded.role == "trainingDepartment"){
                    let result = await TaskModel.findOneAndUpdate(
                            { _id: req.body.idTask},
                            { status: 1 },
                            { new: true }
                        );
                        if(result != null){
                            res.status(200).json({status:true,data:result});
                        } else {
                            res.status(500).json({ error: "Duyệt không thành công" });
                        }         
                } else {
                    res.status(500).json({ error: "Không đúng vai trò" });
                }           
            }
        }
      )
    }else{
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//Get Information By ID
async function getInformation(_id) {
  try {
    var information = await UserModel.findOne({ _id: _id },{});
    return information;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// user apply to the task
async function addApplyJob(user_id, task_id,text) {
  try {
    let isApplied = await TaskModel.findOne(
      {
        _id: task_id,
        "list_student_apply.idStudent": user_id,
      },
      "_id"
    );

    if (isApplied == null) {
      let user = await getInformation(user_id);
      let applyTask = await TaskModel.update(
        { _id: task_id },
        {
          $push: {
            list_student_apply: {
              idStudent: user_id,
              first_name: user.first_name,
              last_name: user.last_name,
              text:text
            },
          },
        }
      );
      if (applyTask) {     
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return { success: false, errors: { message: "Đã ứng tuyển vào task này" } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//user apply job
export const applyTask= async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
      text:"required"
    });
    const matched = await v.check();
    if(matched){
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err,decoded) => {
          if(err){
            res.status(500).json({ error: err });
          }
          if(decoded){
            console.log(decoded);
            if(decoded.role == "student"){
                    let result = await addApplyJob(decoded._id,req.body.idTask,req.body.text);
                    if(result.success){
                        res.status(200).json({status:true,data:result});
                    } else {
                        res.status(500).json({ error: result.errors.message });
                    }         
                } else {
                    res.status(500).json({ error: "Không đúng vai trò" });
                }           
            }
        }
      )
    }else{
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// kdt approve  task for student
async function addApproveJob(user_id, task_id) {
  try {
    let isApplied = await TaskModel.findOne(
      {
        _id: task_id,
        "list_student_approve.idStudent": user_id,
      },
      "_id"
    );

    if (isApplied == null) {
      let user = await getInformation(user_id);
      let applyTask = await TaskModel.update(
        { _id: task_id },
        {
          $push: {
            list_student_approve: {
              idStudent: user_id,
              first_name: user.first_name,
              last_name: user.last_name,
            },
          },
        }
      );
      if (applyTask) {     
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return { success: false, errors: { message: "Đã chấp nhận " } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//user apply job
export const approveTask= async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
      idUser:"required",
    });
    const matched = await v.check();
    if(matched){
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err,decoded) => {
          if(err){
            res.status(500).json({ error: err });
          }
          if(decoded){
            console.log(decoded);
            if(decoded.role == "trainingDepartment"){
                    let result = await addApproveJob(req.body.idUser,req.body.idTask);
                    if(result.success){
                        res.status(200).json({status:true,data:result});
                    } else {
                        res.status(500).json({ error: result.errors.message });
                    }         
                } else {
                    res.status(500).json({ error: "Không đúng vai trò" });
                }           
            }
        }
      )
    }else{
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//get all task
export const search = async (req, res) => {
  const {keySearch} = req.body;
  try {
       const searchResultTask = await TaskModel.find({
        $text : {
            $search :keySearch
        }
       },{});
        const searchResultUser = await UserModel.find({
        $text : {
            $search :keySearch
        }
       },{});
      res.status(200).json({success:true,data:{resultTask:searchResultTask,resultUser:searchResultUser}});
  } catch (e) {
      console.log(e);
  }
};