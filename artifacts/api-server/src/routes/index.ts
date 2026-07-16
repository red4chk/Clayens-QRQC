import { Router, type IRouter } from "express";
import healthRouter from "./health";
import qrqcRouter from "./qrqc";

const router: IRouter = Router();

router.use(healthRouter);
router.use(qrqcRouter);

export default router;
