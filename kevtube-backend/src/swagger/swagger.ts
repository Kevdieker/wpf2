import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "KevTube API",
            version: "1.0.0",
            description: "API für KevTube, um Videos hochzuladen, zu liken und zu kommentieren.",
        },
        servers: [
            {
                url: "http://localhost:8008",
                description: "Lokaler Entwicklungsserver",
            }
        ],
    },
    apis: ["./src/**/*.ts"], // ✅ Now scans all TypeScript files in `src/`
};

const swaggerSpec = swaggerJsdoc(options);

// ✅ Explicitly type `app` as Express
export default (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
