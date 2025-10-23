"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orders_controller_1 = require("../controllers/orders.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Récupère les commandes à préparer (status pending)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                   menus:
 *                     type: array
 *                     items:
 *                       type: object
 *                   status:
 *                     type: string
 *                     enum: [pending]
 *                   createdBy:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle préparateur requis
 *   post:
 *     summary: Crée une nouvelle commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: ID des menus ou des produits avec quantité
 *                   properties:
 *                     productId:
 *                       type: string
 *                     menuId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               status:
 *                 type: string
 *                 enum: [pending, ready, delivered]
 *             anyOf:
 *               - required: [menus]
 *               - required: [products]
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menus:
 *                   type: array
 *                   items:
 *                     type: object
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum: [pending, ready, delivered]
 *       400:
 *         description: Requête invalide - La commande est vide
 *       401:
 *         description: Non autorisé
 *
 * /orders/{id}:
 *   get:
 *     summary: Récupère une commande par son identifiant
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de la commande
 *     responses:
 *       200:
 *         description: Commande trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                 menus:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum: [pending, ready, delivered]
 *                 author:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle préparateur requis
 *       404:
 *         description: Commande non trouvée
 *   patch:
 *     summary: Met à jour le statut d'une commande
 *     tags: [Orders]
 *     description: |
 *       En tant que préparateur : Peut uniquement passer le statut à "ready"
 *       En tant qu'accueil : Peut uniquement passer le statut à "delivered" pour les commandes "ready"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, ready, delivered]
 *     responses:
 *       200:
 *         description: Statut de la commande mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                 menus:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum: [pending, ready, delivered]
 *       400:
 *         description: Requête invalide ou statut invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle ou transition de statut non autorisé
 *       404:
 *         description: Commande non trouvée
 *   delete:
 *     summary: Supprime une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de la commande
 *     responses:
 *       200:
 *         description: Commande supprimée avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Seul l'auteur peut supprimer sa commande
 *       404:
 *         description: Commande non trouvée
 */
router.get('/', (0, role_1.hasRole)('préparateur'), orders_controller_1.getOrdersToPrepare);
router.get('/:id', (0, role_1.hasRole)('préparateur'), orders_controller_1.getOrderById);
router.post('/', (0, role_1.hasRole)('accueil'), orders_controller_1.createOrder);
router.patch('/:id/status', (0, role_1.hasOneOfRole)(['accueil', 'préparateur']), orders_controller_1.updateOrderStatus);
router.delete('/:id', (0, role_1.hasRole)('accueil'), orders_controller_1.deleteOrder);
exports.default = router;
