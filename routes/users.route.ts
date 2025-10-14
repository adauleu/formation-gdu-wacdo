import express from 'express';
import { getUsers, loginUser, registerUser } from '../controllers/users.controller.ts';
import { body } from 'express-validator';
import { hasRole } from '../middleware/role.ts';
import { authMiddleware } from '../middleware/auth.ts';
const router: express.Router = express.Router();

router.get('/', authMiddleware, hasRole('admin'), getUsers);
router.post('/', registerUser);
router.post('/login', body('email').isEmail(), loginUser);

export default router;