import express from 'express';
import { createMenu, getMenuById, getMenus } from '../controllers/menu.controller.ts';

const router: express.Router = express.Router();

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', createMenu);
export default router;