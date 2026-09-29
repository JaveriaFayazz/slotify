import { Router } from "express";
import {
    createBookingController,
    getMyBookingsController,
    cancelBookingController,
    getBusinessBookingsController,
    getAvailableSlotsController,
    updateBookingStatusController
} from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    requireRole("CUSTOMER"),
    createBookingController
);

router.get(
    "/my",
    authenticate,
    requireRole("CUSTOMER"),
    getMyBookingsController
);

router.get(
    "/business/:businessId",
    authenticate,
    requireRole("OWNER"),
    getBusinessBookingsController
);

router.get(
    "/available",
    authenticate,
    requireRole("CUSTOMER"),
    getAvailableSlotsController
);

router.put(
    "/:id/status",
    authenticate,
    requireRole("OWNER"),
    updateBookingStatusController
);

router.put(
    "/:id/cancel",
    authenticate,
    requireRole("CUSTOMER"),
    cancelBookingController
);
export default router;