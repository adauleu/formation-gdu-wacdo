import express from 'express';
import { createMenu, getMenuById, getMenus } from '../controllers/menus.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', createMenu);
export default router;