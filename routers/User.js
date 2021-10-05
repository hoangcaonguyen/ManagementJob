import express from "express";
const router = express.Router();
import path from "path";
import multer from "multer";
import {
  getAll,
  register,
  login,
  confirmAccount,
  deleteAccount,
  updateProfile,
  getCodeVerify,
  newPassword,
  updateImage,
  upload,
  updateProfileNtd,
  getInfo,
  getOneInfo,
  getListNtd,
  getListNtdUnActive,
  getListNtdActive,
  getListStudent,
  registerAdmin,
  getListTaskByNtd,
  getTitleJob,
} from "../controllers/UserController.js";
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
var uploadImage = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /png|jpeg|jpg/;
    const extName = fileTypes.test(path.extname(file.originalname));
    file.originalname.toLowerCase();
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      return cb(new Error("Only image are allowed!"));
    }
  },
});
router.get("/list", getAll);
router.get("/get-one-info", getOneInfo);
router.get("/get-info", getInfo);
router.get("/get-title-job", getTitleJob);
router.get("/get-list-task-by-ntd", getListTaskByNtd);
router.post("/register", register);
router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.post("/confirm-account", confirmAccount);
router.post("/delete-account", deleteAccount);
router.post("/update-cv", updateProfile);
router.post("/update-profile-ntd", updateProfileNtd);
router.post("/get-code-forgot", getCodeVerify);
router.post("/new-password", newPassword);
router.get("/get-list-ntd", getListNtd);
router.get("/get-list-ntd-unactive", getListNtdUnActive);
router.get("/get-list-ntd-active", getListNtdActive);
router.get("/get-list-student", getListStudent);
router.post(
  "/kdt-create-account-for-student",
  uploadFile.single("file"),
  upload
);
router.post("/student-update-image", uploadImage.single("image"), updateImage);
export default router;
