import { Router, type IRouter } from "express";
import healthRouter from "./health";
import spotsRouter from "./spots";
import vehiclesRouter from "./vehicles";
import reservationsRouter from "./reservations";
import transactionsRouter from "./transactions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(spotsRouter);
router.use(vehiclesRouter);
router.use(reservationsRouter);
router.use(transactionsRouter);
router.use(dashboardRouter);

export default router;
