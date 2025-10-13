import express from 'express';
import { getUsers, loginUser, registerUser } from '../controllers/users.controller.ts';
import { body } from 'express-validator';
const router: express.Router = express.Router();

router.get('/', getUsers);
router.post('/', registerUser);
router.post('/login', body('email').isEmail(), loginUser);

export default router;