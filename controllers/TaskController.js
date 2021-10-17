import { TaskModel } from "../models/Task.js";
import { UserModel } from "../models/User.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";

//get all task
export const getAllTask = async (req, res) => {
  try {
    const listTask = await TaskModel.find();
    res.status(200).json({
      status: true,
      data: listTask,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getOnePost = async (req, res) => {
  try {
    let onePost = await TaskModel.findOne({ _id: req.query.id }, {});
    res.status(200).json({
      status: true,
      data: onePost,
    });
  } catch (e) {
    console.log(e);
  }
};

export const getListPostUnactive = async (req, res) => {
  try {
    const listPost = await TaskModel.find({ status: 0 }, {});
    res.status(200).json({
      status: true,
      data: listPost,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getListPostActive = async (req, res) => {
  try {
    const listPost = await TaskModel.find({ status: 1 }, {});
    res.status(200).json({
      status: true,
      data: listPost,
    });
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
            if (decoded.role == "admin") {
              var result = await TaskModel.findOne(
                {
                  _id: req.body.idTask,
                },
                "list_student_apply"
              );
              if (result.list_student_apply.length >= 0) {
                res.status(200).json({
                  status: true,
                  data: result.list_student_apply,
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
      name_job: "required|maxLength:50",
      task_description: "required",
      expires: "required",
      name_company: "required",
      company_email:"required",
      location: "required",
      benefits_enjoyed: "required",
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
              let arr = [
                {
                  require: req.body.require,
                  priorty: req.body.priorty,
                },
              ];
              const task = new TaskModel({
                name_job: req.body.name_job,
                task_owner_id: decoded._id,
                task_description: req.body.task_description,
                expires: req.body.expires,
                location: req.body.location,
                name_company: req.body.name_company,
                company_email:req.body.company_email,
                require_candidate: arr,
                benefits_enjoyed: req.body.benefits_enjoyed,
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
  console.log();
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      arrIdTask: "required",
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
            if (decoded.role == "admin") {
              let result = null;
              for (var i = 0; i < req.body.arrIdTask.length; i++) {
                result = await TaskModel.findOneAndUpdate(
                  { _id: req.body.arrIdTask[i] },
                  { status: 1 },
                  { new: true }
                );
                if (result != null) {
                  res.status(200).json({ status: true, data: result });
                } else {
                  res.status(500).json({ error: "Duyệt không thành công" });
                }
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
              fullName: user.fullName,
              text: text,
              email: user.email,
              type_of_student: user.type_of_student,
              experience: user.experience,
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
            },
          },
          $pull: {
            list_student_apply: {
              idStudent: user_id,
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
      arrIdUser: "required",
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
            let result = null;
            if (decoded.role == "admin") {
              for (var i = 0; i < req.body.arrIdUser.length; i++) {
                result = await addApproveJob(
                  req.body.arrIdUser[i],
                  req.body.idTask
                );
              }
              if (result.success) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(200).json({ error: result.errors.message });
              }
            } else {
              res.status(200).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
      res.status(200).json({ error: v.errors });
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
                fullName: user.fullName,
                email: user.email,
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
              let company = await getInformation(decoded._id);
              let objUser = await getInformation(req.body.idUser);
              let task = await getInformationPost(req.body.idTask);
              let message = `${objUser.fullName} đã pass phỏng vấn công việc ${task.name_job} do công ty ${company.name_company} phỏng vấn`;
              let result1 = await UserModel.findOneAndUpdate(
                { _id: "615c93b603d574a10d31a86d" },
                {
                  $push: {
                    notice: {
                      idCompany: decoded._id,
                      name_company: company.name_company,
                      idUser: req.body.idUser,
                      nameStudent: objUser.fullName,
                      idPost: req.body.idTask,
                      name_job: task.name_job,
                      mes: message,
                    },
                  },
                },
                { new: true }
              );
              if (result.success) {
                res
                  .status(200)
                  .json({ status: true, data: result1 });
              } else {
                res.status(200).json({ error: result.errors.message });
              }
            } else {
              res.status(200).json({ error: "Không đúng vai trò" });
            }
          }
        }
      );
    } else {
      res.status(200).json({ error: v.errors });
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
//search
export const search = async (req, res) => {
  const { keySearch } = req.body;
  try {
    const searchResultTask = await TaskModel.find(
      {
        $text: {
          $search: keySearch,
        },
      },
      {}
    );
    const searchResultUser = await UserModel.find(
      {
        $text: {
          $search: keySearch,
        },
      },
      {}
    );
    res.status(200).json({
      success: true,
      data: { resultTask: searchResultTask, resultUser: searchResultUser },
    });
  } catch (e) {
    console.log(e);
  }
};

//company get student by id task
async function getAllStudentsApproved(task_id) {
  try {
    let isApplied = await TaskModel.findOne(
      {
        _id: task_id,
      },
      ["_id", "list_student_approve"]
    );
    if (isApplied != null) {
      return {
        success: true,
        data: isApplied,
      };
    } else {
      return {
        success: false,
        errors: { message: "Bài viết không tồn tại!!! " },
      };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//kdt get student approved
export const getStudentsApproved = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      task_id: "required",
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
            // console.log(decoded);
            let result = await getAllStudentsApproved(req.body.task_id);
            if (result.success) {
              res.status(200).json({ status: true, data: result });
            } else {
              res.status(500).json({ error: result.errors.message });
            }
          }
        }
      );
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
