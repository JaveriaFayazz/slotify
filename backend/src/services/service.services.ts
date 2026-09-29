import pool from "../database/connection";

interface CreateServiceData {
    businessId: string;
    ownerId: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
}


// CREATE SERVICE
export async function createService(data: CreateServiceData) {
    const {
        businessId,
        name,
        description,
        duration,
        price
    } = data;

    await verifyBusinessOwnership(
        businessId,
        data.ownerId
    );

    const result = await pool.query(
        `INSERT INTO services
            (business_id, name, description, duration, price)
         VALUES
            ($1, $2, $3, $4, $5)
         RETURNING
            id,
            business_id,
            name,
            description,
            duration,
            price`,
        [
            businessId,
            name,
            description || null,
            duration,
            price
        ]
    );

    return result.rows[0];
}


// GET SERVICES FOR OWNER'S BUSINESS
export async function getMyServices(
    businessId: string,
    ownerId: string
) {
    await verifyBusinessOwnership(
        businessId,
        ownerId
    );

    const result = await pool.query(
        `SELECT
            id,
            business_id,
            name,
            description,
            duration,
            price
         FROM services
         WHERE business_id = $1
         ORDER BY name ASC`,
        [businessId]
    );

    return result.rows;
}


// UPDATE SERVICE
export async function updateService(
    serviceId: string,
    businessId: string,
    ownerId: string,
    data: {
        name?: string;
        description?: string;
        duration?: number;
        price?: number;
    }
) {
    const {
        name,
        description,
        duration,
        price
    } = data;

    await verifyBusinessOwnership(
        businessId,
        ownerId
    );

    const result = await pool.query(
        `UPDATE services
         SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            duration = COALESCE($3, duration),
            price = COALESCE($4, price)
         WHERE id = $5
           AND business_id = $6
         RETURNING
            id,
            business_id,
            name,
            description,
            duration,
            price`,
        [
            name,
            description,
            duration,
            price,
            serviceId,
            businessId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Service not found or access denied"
        );
    }

    return result.rows[0];
}


// DELETE SERVICE
export async function deleteService(
    serviceId: string,
    ownerId: string
) {
    const result = await pool.query(
        `DELETE FROM services
         WHERE id = $1
           AND business_id IN (
               SELECT id
               FROM businesses
               WHERE owner_id = $2
           )
         RETURNING id`,
        [
            serviceId,
            ownerId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Service not found or access denied"
        );
    }

    return result.rows[0];
}


// VERIFY BUSINESS OWNERSHIP
async function verifyBusinessOwnership(
    businessId: string,
    ownerId: string
) {
    const result = await pool.query(
        `SELECT id
         FROM businesses
         WHERE id = $1
           AND owner_id = $2`,
        [
            businessId,
            ownerId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error(
            "Business not found or access denied"
        );
    }
}


// GET SERVICES FOR CUSTOMER
export async function getBusinessServices(
    businessId: string
) {
    const result = await pool.query(
        `SELECT
            id,
            business_id,
            name,
            description,
            duration,
            price
         FROM services
         WHERE business_id = $1
         ORDER BY name ASC`,
        [businessId]
    );

    return result.rows;
}