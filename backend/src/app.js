import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { env } from './config/env.js';
import { PUBLIC_DIR } from './config/storage.js';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/index.js';
import { apiRouter } from './routes.js';
import seoRoutes from './modules/seo/seo.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  const allowedOrigins = (process.env.CORS_ORIGINS || env.frontendUrl).split(',').map((s) => s.trim());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.isProd ? 'combined' : 'dev', { skip: (req) => req.path === '/api/v1/health' }));
  }

  // Public uploads only. Private files (resumes) are never mounted.
  app.use(
    '/uploads',
    express.static(PUBLIC_DIR, { maxAge: '7d', immutable: true, index: false, dotfiles: 'deny' }),
  );

  // OpenAPI docs
  const spec = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));
  spec.servers = [{ url: `${env.apiBaseUrl}/api/v1`, description: env.nodeEnv }];
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'Pharma API Docs' }));
  app.get('/api/openapi.json', (req, res) => res.json(spec));

  app.use('/api/v1', apiLimiter, apiRouter);
  app.use('/', seoRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
