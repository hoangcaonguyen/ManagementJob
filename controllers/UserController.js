import {UserModel}  from "../models/User.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";
import CryptoJS from "crypto-js";
import e from "express";

function encrypt(text) {
  return CryptoJS.HmacSHA256(text, process.env.encrypt_secret_key).toString(
    CryptoJS.enc.Hex
  );
}

export const getAll = async (req, res) => {
  try {
      const listUser = await UserModel.find();
      res.status(200).json(listUser);
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
      first_name: "required|maxLength:50",
      last_name: "required|maxLength:50",
      role: "required",
      phonenumber:"required|phoneNumber",
    });
    const matched = await v.check();
    if (matched) {
      if ((await isEmailExit(req.body.email)) == false) {
        const password_hash = encrypt(req.body.password);
        const user = new UserModel({
           password:password_hash ,
           email: req.body.email,
           first_name: req.body.first_name,
           last_name: req.body.last_name,
           role: req.body.role,
           phonenumber:req.body.phonenumber,
           gender:req.body.gender, 
           codeStudent:req.body.codeStudent,
           day_of_birth:req.body.day_of_birth,
           month_of_birth: req.body.month_of_birth,
           year_of_birth:req.body.year_of_birth,
           address:req.body.address,
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
        if(statusUser.status == 1){
            return "success";
        }else{
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
        email: loginquery 
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

//kdt-confirm-account-ntd
export const confirmAccount = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idCompany: "required",
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
                    let result = await UserModel.findOneAndUpdate(
                            { _id: req.body.idCompany},
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



