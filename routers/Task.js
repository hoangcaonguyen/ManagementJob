import express from 'express';
const router = express.Router();
import {getTaskActive,postTask,confirmTask,applyTask,approveTask,getNumberStudentApply,noticeInterview,rateStudent,search} from "../controllers/TaskController.js";

router.get('/list-task-active',getTaskActive);
router.post('/post-task',postTask);
router.post('/confirm-post-task',confirmTask);
router.post('/apply-task',applyTask);
router.post('/approve-for-user',approveTask);
router.post('/get-list-number-student-apply',getNumberStudentApply);
router.post('/ntd-send-notice',noticeInterview);
router.post('/ntd-post-review-sv',rateStudent);
router.post('/search',search);
export default router;