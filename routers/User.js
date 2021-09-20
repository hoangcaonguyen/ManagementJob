import express from 'express';
const router = express.Router();
import multer  from "multer";
import {getAll,register,login,confirmAccount,deleteAccount,updateProfile,getCodeVerify,newPassword,updateImage,upload} from "../controllers/UserController.js";
const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/image/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

var storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/excel/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage1, fileFilter: excelFilter });
var uploadImage = multer({ storage: storage, fileFilter: function (req, file, cb) {
        console.log(file);
        if(file.mimetype=="image/jpg" || file.mimetype=="image/png" || file.mimetype=="image/gif"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    } });
router.get('/list',getAll);
router.post('/register',register);
router.post('/login',login);
router.post('/confirm-account',confirmAccount);
router.post('/delete-account',deleteAccount);
router.post('/edit-profile',updateProfile);
router.post('/get-code-forgot',getCodeVerify);
router.post('/new-password',newPassword);
router.post('/kdt-create-account-for-student',uploadFile.single("file"),upload)
router.post('/student-update-image',uploadImage.single("image"),updateImage)
export default router;