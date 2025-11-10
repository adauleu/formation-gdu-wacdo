import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const serverUrl = process.env.VERCEL
    ? 'https://express-wacdo.vercel.app/api'
    : 'http://localhost:8080/api';

const apis = process.env.VERCEL
    ? [path.join(__dirname, './routes/*.js')] // pour la prod (Vercel)
    : [path.join(__dirname, './routes/*.ts')]; // pour le dev local

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API pour l\'application WacDo',
            version: '1.0.0',
            description: 'Documentation de l\'application WacDo',
        },
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
        servers: [
            {
                url: serverUrl,
            },
        ],
        tags: [
            {
                name: 'Users',
                description: 'Gestion des utilisateurs (accessible à tous, sauf les routes GET, PUT, DELETE /users qui sont réservées aux admins)'
            },
            {
                name: 'Menus',
                description: 'Gestion des menus composés (accessible uniquement aux admins sauf pour la récupération des menus)'
            },
            {
                name: 'Products',
                description: 'Gestion du catalogue de produits (accessible uniquement aux admins sauf pour la récupération des produits)'
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
    apis: apis, // Chemin vers les fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};