import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.route.ts'], // Chemin vers les fichiers contenant les annotations Swagger
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: any) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};