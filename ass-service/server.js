import express from 'express';
import dotenv from 'dotenv';
import models from './models/index.js';
import appointmentRoutes from './routes/appointments.js';
import queueRoutes from './routes/queue.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { notFound, errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();
app.use(express.json());

// routes
app.use('/appointments', appointmentRoutes);
app.use('/queue', queueRoutes);

// OpenAPI docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await models.sequelize.authenticate();
    console.log('Connected to DB');
    await models.ensureInit();
    app.listen(PORT, () => {
      console.log(`ASS service running: http://localhost:${PORT}`);
      console.log(`OpenAPI docs: http://localhost:${PORT}/docs`);
    });
  } catch (e) {
    console.error('Failed to start:', e);
    process.exit(1);
  }
})();
