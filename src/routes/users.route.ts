
import express from 'express';
import { getUsers, loginUser, registerUser } from '../controllers/users.controller';
import { body } from 'express-validator';
import { hasRole } from '../middleware/role';
import { authMiddleware } from '../middleware/auth';

const router: express.Router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé - Rôle admin requis
 *   post:
 *     summary: Inscrit un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Requête invalide ou mot de passe non conforme
 *       409:
 *         description: Nom d'utilisateur déjà utilisé
 *       500:
 *         description: Erreur serveur
 * /users/login:
 *   post:
 *     summary: Connecte un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware, hasRole('admin'), getUsers);
router.post('/', registerUser);
router.post('/login', body('email').isEmail(), loginUser);

export default router;