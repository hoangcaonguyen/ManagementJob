import express from 'express';
const router = express.Router();
import multer  from "multer";
import {getAll,register,login,confirmAccount,deleteAccount,updateProfile,getCodeVerify,newPassword,uploadCSV,upload} from "../controllers/UserController.js";
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
    cb(null, "./upload/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
router.get('/list',getAll);
router.post('/register',register);
router.post('/login',login);
router.post('/confirm-account',confirmAccount);
router.post('/delete-account',deleteAccount);
router.post('/edit-profile',updateProfile);
router.post('/get-code-forgot',getCodeVerify);
router.post('/new-password',newPassword);
router.post('/kdt-create-account-for-sv',uploadCSV)
router.post('/kdt-create-account-for-student',uploadFile.single("image"),upload)
export default router;