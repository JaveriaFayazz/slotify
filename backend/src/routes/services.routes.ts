import { Router } from "express";

import {
  createServiceController,
  getMyServicesController,
  updateServiceController,
  deleteServiceController,
  getBusinessServicesController,
} from "../controllers/service.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("OWNER"),
  createServiceController
);

router.get(
  "/my",
  authenticate,
  requireRole("OWNER"),
  getMyServicesController
);

router.put(
  "/:id",
  authenticate,
  requireRole("OWNER"),
  updateServiceController
);

router.delete(
  "/:id",
  authenticate,
  requireRole("OWNER"),
  deleteServiceController
);

router.get(
  "/business/:businessId",
  authenticate,
  requireRole("CUSTOMER"),
  getBusinessServicesController
);

export default router;