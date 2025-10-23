"use strict";
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("../controllers/users.controller");
const express_validator_1 = require("express-validator");
const role_1 = require("../middleware/role");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, role_1.hasRole)('admin'), users_controller_1.getUsers);
router.post('/', users_controller_1.registerUser);
router.post('/login', (0, express_validator_1.body)('email').isEmail(), users_controller_1.loginUser);
exports.default = router;
