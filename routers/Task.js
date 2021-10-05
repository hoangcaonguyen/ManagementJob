import express from "express";
const router = express.Router();
import {
  getAllTask,
  postTask,
  confirmTask,
  applyTask,
  approveTask,
  getNumberStudentApply,
  noticeInterview,
  rateStudent,
  search,
  getStudentsApproved,
  getListPostUnactive,
  getListPostActive,
} from "../controllers/TaskController.js";

router.get("/list-all-post", getAllTask);
router.get("/list-post-active", getListPostActive);
router.get("/list-post-unactive", getListPostUnactive);
router.post("/post-task", postTask);
router.post("/confirm-post-task", confirmTask);
router.post("/apply-task", applyTask);
router.post("/approve-for-user", approveTask);
router.post("/get-list-number-student-apply", getNumberStudentApply);
router.post("/ntd-send-notice", noticeInterview);
router.post("/ntd-post-review-sv", rateStudent);
router.post("/kdt-get-review", getStudentsApproved);
router.post("/search", search);
export default router;
