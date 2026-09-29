import pool from "../database/connection";

interface CreateBusinessData {
    ownerId: string;
    name: string;
    description?: string;
    location?: string;
    category?: string;
}

export async function createBusiness(data: CreateBusinessData) {
    const {
        ownerId,
        name,
        description,
        location,
        category
    } = data;

    const result = await pool.query(
        `INSERT INTO businesses
            (owner_id, name, description, location, category)
         VALUES
            ($1, $2, $3, $4, $5)
         RETURNING
            id,
            owner_id,
            name,
            description,
            location,
            category,
            created_at`,
        [
            ownerId,
            name,
            description || null,
            location || null,
            category || null
        ]
    );

    return result.rows[0];
}

export async function getMyBusinesses(ownerId: string) {
    const result = await pool.query(
        `SELECT
            id,
            owner_id,
            name,
            description,
            location,
            category,
            created_at
         FROM businesses
         WHERE owner_id = $1
         ORDER BY created_at DESC`,
        [ownerId]
    );

    return result.rows;
}

export async function updateBusiness(
    businessId: string,
    ownerId: string,
    data: {
        name?: string;
        description?: string;
        location?: string;
        category?: string;
    }
) {
    const { name, description, location, category } = data;

    const result = await pool.query(
        `UPDATE businesses
         SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            location = COALESCE($3, location),
            category = COALESCE($4, category)
         WHERE id = $5 AND owner_id = $6
         RETURNING
            id,
            owner_id,
            name,
            description,
            location,
            category,
            created_at`,
        [
            name,
            description,
            location,
            category,
            businessId,
            ownerId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error("Business not found or access denied");
    }

    return result.rows[0];
}

export async function deleteBusiness(
    businessId: string,
    ownerId: string
) {
    const result = await pool.query(
        `DELETE FROM businesses
         WHERE id = $1 AND owner_id = $2
         RETURNING id`,
        [businessId, ownerId]
    );

    if (result.rows.length === 0) {
        throw new Error("Business not found or access denied");
    }

    return result.rows[0];
}
export async function getAllBusinesses() {
    const result = await pool.query(
        `SELECT
            id,
            owner_id,
            name,
            description,
            location,
            category,
            created_at
         FROM businesses
         ORDER BY name ASC`
    );

    return result.rows;
}