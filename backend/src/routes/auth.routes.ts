import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

router.get("/owner-test", authenticate, requireRole("OWNER"), (req, res) => {
    res.json({
        message: "You have OWNER access"
    });
});

export default router;