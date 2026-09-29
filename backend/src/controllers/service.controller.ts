import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
    createService,
    getMyServices,
    getBusinessServices,
    updateService,
    deleteService
} from "../services/service.services";


export async function createServiceController(
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
            name,
            description,
            duration,
            price
        } = req.body;

        if (
            !businessId ||
            !name ||
            duration === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                message:
                    "Business ID, name, duration, and price are required"
            });
        }

        const service = await createService({
            businessId,
            ownerId: req.user.id,
            name,
            description,
            duration,
            price
        });

        return res.status(201).json({
            message: "Service created successfully",
            service
        });

    } catch (error) {
        console.error("Create service error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}


export async function getMyServicesController(
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

        const services = await getMyServices(
            businessId,
            req.user.id
        );

        return res.status(200).json({
            services
        });

    } catch (error) {
        console.error("Get services error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}


export async function updateServiceController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const serviceId = req.params.id as string;

        const {
            businessId,
            name,
            description,
            duration,
            price
        } = req.body;

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        const service = await updateService(
            serviceId,
            businessId,
            req.user.id,
            {
                name,
                description,
                duration,
                price
            }
        );

        return res.status(200).json({
            message: "Service updated successfully",
            service
        });

    } catch (error) {
        console.error("Update service error:", error);

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


export async function deleteServiceController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const serviceId = req.params.id as string;

        // The service ID and logged-in owner's ID are enough.
        // No businessId is required from the DELETE request body.
        await deleteService(
            serviceId,
            req.user.id
        );

        return res.status(200).json({
            message: "Service deleted successfully"
        });

    } catch (error) {
        console.error("Delete service error:", error);

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


export async function getBusinessServicesController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const businessId = String(req.params.businessId);

        if (!businessId) {
            return res.status(400).json({
                message: "Business ID is required"
            });
        }

        const services = await getBusinessServices(businessId);

        return res.status(200).json({
            services
        });

    } catch (error) {
        console.error("Get business services error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}