"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API pour l\'application WacDo',
            version: '1.0.0',
            description: 'Documentation de l\'application WacDo',
        },
        servers: [
            {
                url: `http://localhost:8080/api`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre token JWT'
                },
            },
        },
        tags: [
            {
                name: 'Users',
                description: 'Gestion des utilisateurs (accessible à tous, sauf la route GET /users qui est réservée aux admins)'
            },
            {
                name: 'Menus',
                description: 'Gestion des menus composés (accessible uniquement aux admins)'
            },
            {
                name: 'Products',
                description: 'Gestion du catalogue de produits (accessible uniquement aux admins)'
            },
            {
                name: 'Orders',
                description: 'Gestion des commandes (accessible aux préparateurs et aux équipiers d\'accueil)'
            }
        ],
        security: [{
                bearerAuth: []
            }],
    },
    apis: ['./routes/*.route.ts'], // Chemin vers les fichiers contenant les annotations Swagger
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
