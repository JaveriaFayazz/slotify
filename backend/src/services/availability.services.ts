import pool from "../database/connection";

interface CreateAvailabilityData {
    businessId: string;
    ownerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export async function createAvailability(
    data: CreateAvailabilityData
) {
    const {
        businessId,
        ownerId,
        dayOfWeek,
        startTime,
        endTime
    } = data;

    await verifyBusinessOwnership(businessId, ownerId);

    const result = await pool.query(
        `INSERT INTO availability
            (business_id, day_of_week, start_time, end_time)
         VALUES
            ($1, $2, $3, $4)
         RETURNING
            id,
            business_id,
            day_of_week,
            start_time,
            end_time`,
        [
            businessId,
            dayOfWeek,
            startTime,
            endTime
        ]
    );

    return result.rows[0];
}
export async function getAvailability(
    businessId: string,
    ownerId: string
) {
    await verifyBusinessOwnership(businessId, ownerId);
    const result = await pool.query(
        `SELECT
            id,
            business_id,
            day_of_week,
            start_time,
            end_time
         FROM availability
         WHERE business_id = $1
         ORDER BY day_of_week ASC, start_time ASC`,
        [businessId]
    );

    return result.rows;
}
export async function updateAvailability(
    availabilityId: string,
    businessId: string,
    ownerId: string,
    data: {
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
    }
) {
    const {
        dayOfWeek,
        startTime,
        endTime
    } = data;

    await verifyBusinessOwnership(businessId, ownerId);

    const result = await pool.query(
        `UPDATE availability
         SET
            day_of_week = COALESCE($1, day_of_week),
            start_time = COALESCE($2, start_time),
            end_time = COALESCE($3, end_time)
         WHERE id = $4 AND business_id = $5
         RETURNING
            id,
            business_id,
            day_of_week,
            start_time,
            end_time`,
        [
            dayOfWeek,
            startTime,
            endTime,
            availabilityId,
            businessId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error("Availability not found or access denied");
    }

    return result.rows[0];
}
export async function deleteAvailability(
    availabilityId: string,
    businessId: string,
    ownerId: string
) {
    
    await verifyBusinessOwnership(businessId, ownerId);

    const result = await pool.query(
        `DELETE FROM availability
         WHERE id = $1 AND business_id = $2
         RETURNING id`,
        [availabilityId, businessId]
    );

    if (result.rows.length === 0) {
        throw new Error("Availability not found or access denied");
    }

    return result.rows[0];
}

async function verifyBusinessOwnership(
    businessId: string,
    ownerId: string
) {
    const result = await pool.query(
        `SELECT id
         FROM businesses
         WHERE id = $1 AND owner_id = $2`,
        [businessId, ownerId]
    );

    if (result.rows.length === 0) {
        throw new Error("Business not found or access denied");
    }
}