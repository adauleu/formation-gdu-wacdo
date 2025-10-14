import express from 'express';
import { createMenu, deleteMenu, getMenuById, getMenus } from '../controllers/menus.controller.ts';
import { authMiddleware } from '../middleware/auth.ts';
import { hasRole } from '../middleware/role.ts';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.use(hasRole('admin'))

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', createMenu);
router.delete('/', deleteMenu);
export default router;