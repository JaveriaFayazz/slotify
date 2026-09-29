import pool from "../database/connection";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: "CUSTOMER" | "OWNER";
}

export async function registerUser(data: RegisterData) {
    const { name, email, password, role } = data;

    // Check whether the email is already registered
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email is already registered");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    // Create JWT token
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        secret,
        {
            expiresIn: "7d"
        }
    );

    return {
        user,
        token
    };
}

export async function loginUser(email: string, password: string) {
    // Find the user by email
    const result = await pool.query(
        "SELECT id, name, email, password, role, created_at FROM users WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Compare the entered password with the hashed password
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        throw new Error("Invalid email or password");
    }

    // Get JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    // Create JWT token
    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        secret,
        {
            expiresIn: "7d"
        }
    );

    // Never send the password back to the client
    delete user.password;

    return {
        user,
        token
    };
}