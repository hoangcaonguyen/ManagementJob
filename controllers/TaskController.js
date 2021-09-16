import { TaskModel } from "../models/Task.js";
import { UserModel } from "../models/User.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";

//get all task
export const getTaskActive = async (req, res) => {
  try {
    const listTask = await TaskModel.find({ status: 1 });
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
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "trainingDepartment") {
              var result = await TaskModel.findOne(
                {
                  _id: req.body.idTask,
                },
                "list_student_apply"
              );
              console.log(result.list_student_apply.length);
              if (result.list_student_apply.length >= 0) {
                res.status(200).json({
                  status: true,
                  data: result.list_student_apply.length,
                });
              } else {
                res.status(500).json({ error: "Thất bại" });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
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
      price: "required",
      location: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            if (decoded.role == "company") {
              const task = new TaskModel({
                task_title: req.body.task_title,
                task_owner_id: decoded._id,
                task_owner_first_name: decoded.first_name,
                task_owner_last_name: decoded.last_name,
                task_description: req.body.task_description,
                price: req.body.price,
                location: req.body.location,
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
      );
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
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "trainingDepartment") {
              let result = await TaskModel.findOneAndUpdate(
                { _id: req.body.idTask },
                { status: 1 },
                { new: true }
              );
              if (result != null) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(500).json({ error: "Duyệt không thành công" });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//Get Information By ID
async function getInformation(_id) {
  try {
    var information = await UserModel.findOne({ _id: _id }, {});
    return information;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// user apply to the task
async function addApplyJob(user_id, task_id, text) {
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
              text: text,
            },
          },
        }
      );
      if (applyTask) {
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return {
        success: false,
        errors: { message: "Đã ứng tuyển vào task này" },
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//user apply job
export const applyTask = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
      text: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "student") {
              let result = await addApplyJob(
                decoded._id,
                req.body.idTask,
                req.body.text
              );
              if (result.success) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(500).json({ error: result.errors.message });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
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
export const approveTask = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
      idUser: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "trainingDepartment") {
              let result = await addApproveJob(
                req.body.idUser,
                req.body.idTask
              );
              if (result.success) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(500).json({ error: result.errors.message });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//company notice student pass or not interview
async function addNoticeInterview(user_id, task_id) {
  try {
    let isApplied = await TaskModel.findOne(
      {
        _id: task_id,
        "list_student_pass_interview.idStudent": user_id,
      },
      "_id"
    );

    if (isApplied == null) {
      let user = await getInformation(user_id);
      let _id_approved = await TaskModel.findOne({
        "list_student_approve.idStudent": user_id,
      });
      if (_id_approved != null) {
        let applyTask = await TaskModel.update(
          { _id: task_id },
          {
            $push: {
              list_student_pass_interview: {
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
        return {
          success: false,
          errors: { message: "sinh viên chưa được approve!!! " },
        };
      }
    } else {
      return { success: false, errors: { message: "Đã pass interview " } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//Notice of interview
export const noticeInterview = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idTask: "required",
      idUser: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "company") {
              let result = await addNoticeInterview(
                req.body.idUser,
                req.body.idTask
              );
              if (result.success) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(500).json({ error: result.errors.message });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//company rate student worked
async function addRateStudent(user_id, task_id, rate_comment) {
  try {
    let isApplied = await TaskModel.findOne(
      {
        _id: task_id,
        "list_student_pass_interview.idStudent": user_id,
      },
      "_id"
    );
    let isComment = await UserModel.findOne({
      "list_rate.rater_comment": rate_comment,
    });

    if (isApplied != null) {
      if (isComment == null) {
        // let user = await getInformation(user_id);
        let addComment = await UserModel.update(
          { _id: user_id },
          {
            $push: {
              list_rate: {
                rater_id: user_id,
                id_task: task_id,
                rater_comment: rate_comment,
              },
            },
          }
        );
        if (addComment) {
          return { success: true };
        }
        return { success: false, errors: { message: "Undefined errors" } };
      } else {
        return {
          success: false,
          errors: { message: "Sinh viên đã được rate!!! " },
        };
      }
    } else {
      return {
        success: false,
        errors: { message: "Sinh viên chưa pass phỏng vấn " },
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//ntd rate student
export const rateStudent = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      user_id: "required",
      task_id: "required",
      rate_comment: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "company") {
              let result = await addRateStudent(
                req.body.user_id,
                req.body.task_id,
                req.body.rate_comment
              );
              if (result.success) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(500).json({ error: result.errors.message });
              }
            } else {
              res.status(500).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
