import express from 'express';
const router = express.Router();
import {getAll,register,login,confirmAccount,deleteAccount,updateProfile,getCodeVerify,newPassword,uploadCSV} from "../controllers/UserController.js";

router.get('/list',getAll);
router.post('/register',register);
router.post('/login',login);
router.post('/confirm-account',confirmAccount);
router.post('/delete-account',deleteAccount);
router.post('/edit-profile',updateProfile);
router.post('/get-code-forgot',getCodeVerify);
router.post('/new-password',newPassword);
router.post('/kdt-create-account-for-sv',uploadCSV)
export default router;