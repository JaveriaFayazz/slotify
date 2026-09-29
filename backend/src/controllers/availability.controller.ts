import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    createAvailability,
    getAvailability,
    updateAvailability,
    deleteAvailability
} from "../services/availability.services";

export async function createAvailabilityController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const {
            businessId,
            dayOfWeek,
            startTime,
            endTime
        } = req.body;

        if (
            !businessId ||
            dayOfWeek === undefined ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                message: "Business ID, day of week, start time, and end time are required"
            });
        }

        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({
                message: "Day of week must be between 0 and 6"
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                message: "End time must be later than start time"
            });
        }

        const availability = await createAvailability({
            businessId,
            ownerId: req.user.id,
            dayOfWeek,
            startTime,
            endTime
});

        return res.status(201).json({
            message: "Availability created successfully",
            availability
        });
    } catch (error) {
        console.error("Create availability error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function getAvailabilityController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const businessId = req.query.businessId as string;

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        const availability = await getAvailability(
            businessId,
            req.user.id
);
        return res.status(200).json({
            availability
        });
    } catch (error) {
        console.error("Get availability error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function updateAvailabilityController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const availabilityId = req.params.id as string;

        const {
            businessId,
            dayOfWeek,
            startTime,
            endTime
        } = req.body;

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        if (
            dayOfWeek !== undefined &&
            (dayOfWeek < 0 || dayOfWeek > 6)
        ) {
            return res.status(400).json({
                message: "Day of week must be between 0 and 6"
            });
        }

        if (
            startTime &&
            endTime &&
            startTime >= endTime
        ) {
            return res.status(400).json({
                message: "End time must be later than start time"
            });
        }

        const availability = await updateAvailability(
            availabilityId,
            businessId,
            req.user.id,
    {
        dayOfWeek,
        startTime,
        endTime
    }
);

        return res.status(200).json({
            message: "Availability updated successfully",
            availability
        });
    } catch (error) {
        console.error("Update availability error:", error);

        if (error instanceof Error) {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function deleteAvailabilityController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const availabilityId = req.params.id as string;
        const { businessId } = req.body;

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        await deleteAvailability(
            availabilityId,
            businessId,
            req.user.id
);

        return res.status(200).json({
            message: "Availability deleted successfully"
        });
    } catch (error) {
        console.error("Delete availability error:", error);

        if (error instanceof Error) {
            return res.status(404).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}