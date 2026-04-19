import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({
    id: req.auth!.userId,
    email: req.auth!.email ?? undefined,
    role: req.auth!.role,
  });
});

export default router;
