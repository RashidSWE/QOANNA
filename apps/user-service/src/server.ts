
import type { Application } from 'express';
import { createRequire } from 'node:module';
import cors from "cors";
import cookieParser from "cookie-parser"
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import userRoutes from "./routes/user.js"
import authRoutes from "./routes/auth.js"
const require = createRequire(import.meta.url);

const express = require('express');

const app: Application = express()

app.use(cors())
app.use(express.json())

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Qo\'annaa API',
      version: '1.0.0',
    },
  },
  apis: ['./apps/user-service/src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cookieParser())
app.use("/v1/users", userRoutes)
app.use("/v1/auth", authRoutes)
export default app