import express from 'express';
const router = express.Router();
import {getAll,register,login,confirmAccount} from "../controllers/UserController.js";

router.get('/list',getAll);
router.post('/register',register);
router.post('/login',login);
router.post('/confirm-account',confirmAccount);
export default router;