import express from 'express';
import { getProducts, createProduct, getProductById, deleteProduct, updateProduct } from '../controllers/products.controller';
import { authMiddleware } from '../middleware/auth';
import { hasRole } from '../middleware/role';
import { upload } from '../middleware/multer';

const router: express.Router = express.Router();

router.use(authMiddleware)
router.use(hasRole('admin'))

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Récupère tous les produits
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   isAvailable:
 *                     type: boolean
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *   post:
 *     summary: Crée un nouveau produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image:
 *                   type: string
 *                 isAvailable:
 *                   type: boolean
 *       400:
 *         description: Requête invalide - Name ou price manquant
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *       409:
 *         description: Conflit - Le produit existe déjà
 * 
 * /products/{id}:
 *   get:
 *     summary: Récupère un produit par son identifiant
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du produit
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image:
 *                   type: string
 *                 isAvailable:
 *                   type: boolean
 *       400:
 *         description: ID de produit invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *       404:
 *         description: Produit non trouvé
 *   put:
 *     summary: Met à jour un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du produit
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               isAvailable:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 image:
 *                   type: string
 *                 isAvailable:
 *                   type: boolean
 *       400:
 *         description: ID de produit invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *       404:
 *         description: Produit non trouvé
 *   delete:
 *     summary: Supprime un produit
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       400:
 *         description: ID de produit invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *       404:
 *         description: Produit non trouvé
 */

router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.post('/', upload.single('image'), createProduct);
router.delete('/:id', deleteProduct);
export default router;