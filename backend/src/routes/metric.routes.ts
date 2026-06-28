import { Router } from 'express';
import { metricController } from '../controllers/metric.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /metrics
router.get('/', (req, res, next) => metricController.getMetrics(req, res, next));

export default router;
