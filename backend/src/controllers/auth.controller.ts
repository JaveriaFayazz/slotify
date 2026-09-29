import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.services";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export function getMe(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
        message: "Authenticated user",
        user: req.user
    });
}

export async function register(req: Request, res: Response) {

    try {
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password, and role are required"
            });
        }

        if (role !== "CUSTOMER" && role !== "OWNER") {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const result = await registerUser({
            name,
            email,
            password,
            role
        });

        return res.status(201).json({
            message: "User registered successfully",
            ...result
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await loginUser(email, password);

        return res.status(200).json({
            message: "Login successful",
            ...result
        });
    } catch (error) {
        console.error("Login error:", error);

        if (error instanceof Error) {
            return res.status(401).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}