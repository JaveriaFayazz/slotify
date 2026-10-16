import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type UserRole = "CUSTOMER" | "OWNER" | "ADMIN";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}

interface AccessTokenPayload {
    id: string;
    role: UserRole;
}

const validRoles: UserRole[] = ["CUSTOMER", "OWNER", "ADMIN"];

export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.slice("Bearer ".length).trim();

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({
                message: "JWT_SECRET is not configured"
            });
        }

        const decoded = jwt.verify(token, secret);

        // A valid access token must contain an object payload.
        if (typeof decoded !== "object" || decoded === null) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        const payload = decoded as Partial<AccessTokenPayload>;

        // Require a non-empty user ID and an allowed role.
        if (
            typeof payload.id !== "string" ||
            payload.id.trim().length === 0 ||
            typeof payload.role !== "string" ||
            !validRoles.includes(payload.role as UserRole)
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = {
            id: payload.id,
            role: payload.role as UserRole
        };

        return next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}