import { UserModel } from "../models/User.js";
import { TaskModel } from "../models/Task.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";
import xlsx from "xlsx";
import CryptoJS from "crypto-js";
("use strict");
import nodemailer from "nodemailer";
import * as csv from "fast-csv";
import * as fs from "fs";
import multer from "multer";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: "ilike",
  api_key: "678772438397898",
  api_secret: "zvdEWEfrF38a2dLOtVp-3BulMno",
});

function encrypt(text) {
  return CryptoJS.HmacSHA256(text, process.env.encrypt_secret_key).toString(
    CryptoJS.enc.Hex
  );
}

const uploadImg = async (path) => {
  let res;
  try {
    res = await cloudinary.uploader.upload(path);
  } catch (err) {
    console.log(err);
    return false;
  }
  return res.secure_url;
};

export const getAll = async (req, res) => {
  try {
    const listUser = await UserModel.find();
    res.status(200).json(listUser);
  } catch (e) {
    console.log(e);
  }
};
export const getListNtd = async (req, res) => {
  try {
    const listNtd = await UserModel.find({ role: "company" }, {});
    res.status(200).json({
      status: true,
      data: listNtd,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getListStudent = async (req, res) => {
  try {
    const listStudent = await UserModel.find({ role: "student" }, {});
    res.status(200).json({
      status: true,
      data: listStudent,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getListNtdUnActive = async (req, res) => {
  try {
    const listNtd = await UserModel.find({ role: "company", status: 0 }, {});
    res.status(200).json({
      status: true,
      data: listNtd,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getListNtdActive = async (req, res) => {
  try {
    const listNtd = await UserModel.find({ role: "company", status: 1 }, {});
    res.status(200).json({
      status: true,
      data: listNtd,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getOneInfo = async (req, res) => {
  try {
    let listUser = await UserModel.findOne({ _id: req.query.id }, [
      "fullName",
      "email",
      "phonenumber",
      "title_job",
      "additional_info",
      "gender",
      "birthday",
      "certification",
      "experience",
      "major",
      "name_of_school",
      "image",
      "objective",
      "type_of_student",
      "skills",
      "address",
      "role",
      "name_Hr",
      "company_summary",
      "address",
      "name_company",
    ]);
    res.status(200).json({
      status: true,
      data: listUser,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getInfo = async (req, res) => {
  let arrType = ["AT14-CT2", "AT15-CT3", "AT16-CT4", "CT17-CT5"];
  let arrMajor = [
    "Công nghệ thông tin",
    "An toàn thông tin",
    "Điện tử viễn thông",
  ];
  let arrSex = ["male", "female", "other"];
  let objects = {
    arrType,
    arrMajor,
    arrSex,
  };
  try {
    res.status(200).json({
      status: true,
      data: objects,
    });
  } catch (e) {
    console.log(e);
  }
};
export const getTitleJob = async (req, res) => {
  let arrTitleJob = [
    "Android fresher",
    "Unity Game Developer (Fresher/Junior)",
    "MIDDLE ANDROID DEVELOPER",
    "Front End Mobile App Dev - React Native",
    "PHP Developer Game",
    "iOS Developer",
    "Full Stack Developer - All Levels",
    "Mobile Dev (iOS, Android, React Native)",
    "React Native Developer",
    "React Native Engineer",
    "Data Engineer",
    "Flutter Developer (iOS, Android)",
    "AI",
  ];
  let objects = {
    arrTitleJob,
  };
  try {
    res.status(200).json({
      status: true,
      data: objects,
    });
  } catch (e) {
    console.log(e);
  }
};
//user-register
export const register = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      password: "required|minLength:8",
      email: "required|email",
      name_company: "required|maxLength:50",
      role: "required",
      company_summary: "required",
      phonenumber: "required|phoneNumber",
      address: "required",
      name_Hr: "required",
    });
    const matched = await v.check();
    if (matched) {
      if ((await isEmailExit(req.body.email)) == false) {
        const password_hash = encrypt(req.body.password);
        const user = new UserModel({
          password: password_hash,
          email: req.body.email,
          name_company: req.body.name_company,
          role: req.body.role,
          phonenumber: req.body.phonenumber,
          address: req.body.address,
          company_summary: req.body.company_summary,
          name_Hr: req.body.name_Hr,
        });
        await user.save(function (err) {
          if (err) {
            res.status(500).json({ errors: err });
          } else {
            res.status(200).json({ success: true, data: user });
          }
        });
      } else {
        res
          .status(500)
          .json({ success: false, messages: "Email đã tồn tại !!!" });
      }
    } else {
      res.status(500).json({ errors: v.errors });
    }
  } catch (err) {
    res.status(500).json({ errors: err });
  }
};
export const registerAdmin = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      password: "required|minLength:8",
      email: "required|email",
      role: "required",
      secret_key: "required",
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
              if ((await isEmailExit(req.body.email)) == false) {
                const password_hash = encrypt(req.body.password);
                const user = new UserModel({
                  password: password_hash,
                  email: req.body.email,
                  role: req.body.role,
                  status: 1,
                });
                await user.save(function (err) {
                  if (err) {
                    res.status(500).json({ success: false, errors: err });
                  } else {
                    res.status(200).json({ success: true, data: user });
                  }
                });
              } else {
                res.status(500).json({
                  success: false,
                  messages: "Email đã tồn tại !!!",
                });
              }
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
//ckeck email exist
async function isEmailExit(email) {
  try {
    const result = await UserModel.findOne({ email: email });
    let kq = false;
    if (result != null) {
      kq = true;
    }
    return kq;
  } catch (err) {
    throw err;
  }
}
//checkLogin
async function checkLogin(email, password) {
  const passwordUser = await UserModel.findOne(
    { email: email },
    { password: 1, _id: 0 }
  );
  const statusUser = await UserModel.findOne(
    { email: email },
    { status: 1, _id: 0 }
  );
  console.log(statusUser);
  if (passwordUser != null) {
    if (passwordUser.password == password) {
      if (statusUser.status == 1) {
        return "success";
      } else {
        console.log("sds");
        return { message: "Tài khoản chưa được khoa đào tạo duyệt" };
      }
    } else {
      return { message: "Mật khẩu không chính xác !!" };
    }
  } else if (passwordUser == null) {
    return { message: "Email không tồn tại !!" };
  }
}

//get-userId
async function getUserID(loginquery) {
  try {
    var id = await UserModel.findOne(
      {
        email: loginquery,
      },
      "_id"
    );
    return id._id;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//user-login
export const login = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      password: "required|minLength:8",
      email: "required|email",
    });
    const matched = await v.check();
    if (matched) {
      const password_hash = encrypt(req.body.password);
      const result = await checkLogin(req.body.email, password_hash);
      if (result == "success") {
        const ID = await getUserID(req.body.email);
        const information = await UserModel.findOne({ _id: ID });
        const tokenInformation = {
          _id: ID,
          email: information.email,
          first_name: information.first_name,
          last_name: information.last_name,
          role: information.role,
        };
        jwt.sign(
          tokenInformation,
          process.env.login_secret_key,
          (err, token) => {
            if (err) {
              console.log(err);
            }
            const loginresult = {
              success: true,
              secret_key: token,
            };
            res.status(200).json({ success: true, data: loginresult });
          }
        );
      } else {
        res.status(500).json({ success: false, errors: result });
      }
    } else {
      res.status(500).json({ errors: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getListTaskByNtd = async (req, res) => {
  try {
    let listTask = await TaskModel.find({ task_owner_id: req.query.idNtd });
    res.status(200).json({
      status: true,
      data: listTask,
    });
  } catch (e) {
    console.log(e);
  }
};
//kdt-confirm-account-ntd
export const confirmAccount = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      arrIdCompany: "required",
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
              let result = null;
              for (var i = 0; i < req.body.arrIdCompany.length; i++) {
                result = await UserModel.findOneAndUpdate(
                  { _id: req.body.arrIdCompany[i] },
                  { status: 1 },
                  { new: true }
                );
              }
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

async function sendMail(toMail, subject, content) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(
    `smtps://${process.env.EMAIL}:${process.env.PASS}@smtp.gmail.com`
  );

  let body = content;
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Khoa đào tạo👻" <khoadaotao@gmail.com>', // sender address
    to: toMail, // list of receivers
    subject: subject, // Subject line
    text: content, // plain text body
    html: `<p>${body}</p>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

//kdt-delete-account
export const deleteAccount = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
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
              let email = await getEmailById(req.body.idUser);
              let deleteUser = await UserModel.deleteOne({
                _id: req.body.idUser,
              });
              if (deleteUser) {
                sendMail(
                  email,
                  "Thông báo",
                  "Tài khoản bạn vi phạm nội qui của khoa đào tạo nên đã bị xóa"
                );
                res
                  .status(200)
                  .json({ status: true, result: "Xóa thành công" });
              } else {
                res.status(500).json({ error: "Xóa thất bại" });
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

//get email by idUser
async function getEmailById(id) {
  try {
    var user = await UserModel.findOne(
      {
        _id: id,
      },
      "email"
    );
    return user.email;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//update profile
export const updateProfile = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
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
            let result = await editPersonalInformation(
              decoded._id,
              req.body.fullName,
              req.body.phonenumber,
              req.body.gender,
              req.body.birthday,
              req.body.address,
              req.body.title_job,
              req.body.additional_info,
              req.body.certification,
              req.body.experience,
              req.body.major,
              req.body.name_of_school,
              req.body.type_of_student,
              req.body.objective,
              req.body.skills
            );
            console.log(result);
            if (result.status == true) {
              res.status(200).json(result);
            } else {
              res.status(500).json(result);
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
//update profile ntd
export const updateProfileNtd = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
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
            let result = await editPersonalInformationNtd(
              decoded._id,
              req.body.name_company,
              req.body.phonenumber,
              req.body.address,
              req.body.company_summary,
              req.body.name_Hr
            );
            console.log(result);
            if (result.status == true) {
              res.status(200).json(result);
            } else {
              res.status(500).json(result);
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

async function editPersonalInformationNtd(
  _id,
  name_company,
  phonenumber,
  address,
  company_summary,
  name_Hr
) {
  try {
    let userDocs = {
      name_company: name_company,
      phonenumber: phonenumber,
      address: address,
      company_summary: company_summary,
      name_Hr: name_Hr,
    };
    // console.log(userDocs);
    let result = await UserModel.updateOne({ _id: _id }, userDocs);
    if (result) {
      return { status: true, data: userDocs };
    } else {
      return { status: false, errors: "update thất bại" };
    }
  } catch (e) {
    return e;
  }
}

// Edit personal information
async function editPersonalInformation(
  _id,
  fullName,
  phonenumber,
  gender,
  birthday,
  address,
  title_job,
  additional_info,
  certification,
  experience,
  major,
  name_of_school,
  type_of_student,
  objective,
  skills
) {
  try {
    let userDocs = {
      fullName: fullName,
      phonenumber: phonenumber,
      gender: gender,
      birthday: birthday,
      address: address,
      title_job: title_job,
      additional_info: additional_info,
      certification: certification,
      experience: experience,
      major: major,
      name_of_school: name_of_school,
      type_of_student: type_of_student,
      objective: objective,
      skills: skills,
    };
    // console.log(userDocs);
    let result = await UserModel.updateOne({ _id: _id }, userDocs);
    if (result) {
      return { status: true, data: userDocs };
    } else {
      return { status: false, errors: "update thất bại" };
    }
  } catch (e) {
    return e;
  }
}

//get-verify-forgot-pass
export const getCodeVerify = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      email: "required",
    });
    const matched = await v.check();
    if (matched) {
      let verifyNumber = Math.floor(Math.random() * (9999 - 1000) + 1000);
      let result = await UserModel.findOneAndUpdate(
        { email: req.body.email },
        { codeVerify: verifyNumber },
        { new: true }
      );
      if (result != null) {
        sendMail(
          req.body.email,
          "Code forgot password of you",
          verifyNumber.toString()
        );
        res
          .status(200)
          .json({ status: true, data: "Vui lòng check mail để lấy mã" });
      } else {
        res.status(500).json({ error: "Email không tồn tại" });
      }
    } else {
      console.log("1");
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    console.log("2");
    res.status(500).json({ error: err });
  }
};
export const newPassword = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      email: "required",
      code: "required",
      password: "required",
    });
    const matched = await v.check();
    if (matched) {
      const password_hash = encrypt(req.body.password);
      let result = await UserModel.findOneAndUpdate(
        { email: req.body.email, codeVerify: req.body.code },
        { password: password_hash },
        { new: true }
      );
      if (result != null) {
        res
          .status(200)
          .json({ status: true, data: "Cập nhập mật khẩu thành công" });
      } else {
        res.status(500).json({ error: "Email or code không đúng" });
      }
    } else {
      res.status(500).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//process file CSV
async function processFileCSV(file) {
  try {
    var stream = fs.createReadStream(file);
    var csvStream = csv().on("data", function (data) {
      var item = {
        name: data[0],
        price: data[1],
        category: data[2],
        description: data[3],
        manufacturer: data[4],
      };
      stream.pipe(csvStream);
      let result = item;
      if (result) {
        return { success: true, data: result };
      } else {
        return { success: false, errors: { message: "upload thất bại" } };
      }
    });
  } catch (e) {
    return e;
  }
}

//upload user from csv to mongodb
export const uploadCSV = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      file: "required",
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
              let result = await processFileCSV(req.body.file);
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

export const upload = async (req, res) => {
  try {
    var src = "./public/excel/" + req.file.filename;
    var wb = await xlsx.readFile(src, { cellDates: true });
    var ws = wb.Sheets[wb.SheetNames];
    var data = xlsx.utils.sheet_to_json(ws);
    for (var i = 0; i < data.length; i++) {
      if ((await isEmailExit(data[i].email)) == false) {
        const password_hash = encrypt(data[i].password);
        const user = new UserModel({
          password: password_hash,
          email: data[i].email,
          fullName: data[i].fullName,
          role: data[i].role,
          phonenumber: data[i].phonenumber,
          birthday: data[i].birthday,
          gender: data[i].gender,
          type_of_student: data[i].type_of_student,
          status: data[i].status,
        });
        await user.save();
      } else {
        res.status(500).json({ mess: "Có email tồn tại email trong hệ thống" });
      }
    }
    res.status(200).json({ status: true, mess: "Thêm thành công" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
//kdt-delete-account
export const updateImage = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
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
            let urlImg = await uploadImg(req.file.path);
            if (urlImg === false) {
              res.status(500).json({ msg: "server error" });
              return;
            }
            let result = await UserModel.findOneAndUpdate(
              { _id: decoded._id },
              { image: urlImg },
              { new: true }
            );
            if (result != null) {
              res.status(200).json({ status: true, data: result });
            } else {
              res.status(500).json({ error: "Cập nhật ảnh thất bại" });
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
