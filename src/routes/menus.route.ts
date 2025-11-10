import express from 'express';
import { createMenu, deleteMenu, getMenuById, getMenus, updateMenu } from '../controllers/menus.controller';
import { authMiddleware } from '../middleware/auth';
import { hasRole } from '../middleware/role';

const router: express.Router = express.Router();

router.use(authMiddleware)

/**
 * @swagger
 * /menus:
 *   get:
 *     summary: Récupère tous les menus
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: Liste des menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *   post:
 *     summary: Crée un nouveau menu
 *     tags: [Menus]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - products
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID des produits
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Menu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 price:
 *                   type: number
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *
 * /menus/{id}:
 *   get:
 *     summary: Récupère un menu par son identifiant
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du menu
 *     responses:
 *       200:
 *         description: Menu trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 price:
 *                   type: number
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu non trouvé
 *
 *   put:
 *     summary: Met à jour un menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du menu à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - products
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID des produits
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Menu mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                 price:
 *                   type: number
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu non trouvé
 *
 *   delete:
 *     summary: Supprime un menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du menu à supprimer
 *     responses:
 *       200:
 *         description: Menu supprimé avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu non trouvé
 */


router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', hasRole('admin'), createMenu);
router.put('/:id', hasRole('admin'), updateMenu);
router.delete('/:id', hasRole('admin'), deleteMenu);
export default router;