import { Router } from "express";
import {
    createBusinessController,
    getMyBusinessesController,
    getAllBusinessesController,
    updateBusinessController,
    deleteBusinessController
} from "../controllers/business.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    requireRole("OWNER"),
    createBusinessController
);

router.get(
    "/my",
    authenticate,
    requireRole("OWNER"),
    getMyBusinessesController
);

router.put(
    "/:id",
    authenticate,
    requireRole("OWNER"),
    updateBusinessController
);
router.get(
    "/",
    authenticate,
    requireRole("CUSTOMER"),
    getAllBusinessesController
);

router.delete(
    "/:id",
    authenticate,
    requireRole("OWNER"),
    deleteBusinessController
);

export default router;