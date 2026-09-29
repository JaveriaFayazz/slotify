import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    createBusiness,
    getMyBusinesses,
    getAllBusinesses,
    updateBusiness,
    deleteBusiness
} from "../services/business.services";

export async function createBusinessController(
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
            name,
            description,
            location,
            category
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Business name is required"
            });
        }

        const business = await createBusiness({
            ownerId: req.user.id,
            name,
            description,
            location,
            category
        });

        return res.status(201).json({
            message: "Business created successfully",
            business
        });
    } catch (error) {
        console.error("Create business error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function getMyBusinessesController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const businesses = await getMyBusinesses(req.user.id);

        return res.status(200).json({
            businesses
        });
    } catch (error) {
        console.error("Get my businesses error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function updateBusinessController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const id = req.params.id as string;

        const {
            name,
            description,
            location,
            category
        } = req.body;

        const business = await updateBusiness(
            id,
            req.user.id,
            {
                name,
                description,
                location,
                category
            }
        );

        return res.status(200).json({
            message: "Business updated successfully",
            business
        });
    } catch (error) {
        console.error("Update business error:", error);

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

export async function deleteBusinessController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const id = req.params.id as string;

        await deleteBusiness(
            id,
            req.user.id
        );

        return res.status(200).json({
            message: "Business deleted successfully"
        });
    } catch (error) {
        console.error("Delete business error:", error);

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

export async function getAllBusinessesController(
    req: AuthenticatedRequest,
    res: Response
) {
    try {
        const businesses = await getAllBusinesses();

        return res.status(200).json({
            businesses
        });
    } catch (error) {
        console.error("Get all businesses error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}