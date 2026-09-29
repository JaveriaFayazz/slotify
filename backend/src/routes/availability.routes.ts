import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
    createAvailabilityController,
    getAvailabilityController,
    updateAvailabilityController,
    deleteAvailabilityController
} from "../controllers/availability.controller";

const router = Router();

router.post(
    "/",
    authenticate,
    requireRole("OWNER"),
    createAvailabilityController
);

router.get(
    "/my",
    authenticate,
    requireRole("OWNER"),
    getAvailabilityController
);
router.put(
    "/:id",
    authenticate,
    requireRole("OWNER"),
    updateAvailabilityController
);
router.delete(
    "/:id",
    authenticate,
    requireRole("OWNER"),
    deleteAvailabilityController
);
export default router;
