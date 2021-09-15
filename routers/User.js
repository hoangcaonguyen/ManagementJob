import express from 'express';
const router = express.Router();
import {getAll,register,login,confirmAccount,deleteAccount} from "../controllers/UserController.js";

router.get('/list',getAll);
router.post('/register',register);
router.post('/login',login);
router.post('/confirm-account',confirmAccount);
router.post('/delete-account',deleteAccount);
export default router;