import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
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

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};