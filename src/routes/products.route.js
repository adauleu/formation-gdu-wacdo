"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products_controller_1 = require("../controllers/products.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const multer_1 = require("../middleware/multer");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router.use((0, role_1.hasRole)('admin'));
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
router.get('/', products_controller_1.getProducts);
router.get('/:id', products_controller_1.getProductById);
router.put('/:id', multer_1.upload.single('image'), products_controller_1.updateProduct);
router.post('/', multer_1.upload.single('image'), products_controller_1.createProduct);
router.delete('/:id', products_controller_1.deleteProduct);
exports.default = router;
