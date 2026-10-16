import { Pool, types } from "pg";
import dotenv from "dotenv";

dotenv.config({ override: true });

types.setTypeParser(1082, (value) => value);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),

    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : undefined,
});

// Temporary database connection test
// pool.query("SELECT current_user, current_database()")
//     .then((result) => {
//         console.log("✅ DATABASE CONNECTION SUCCESSFUL");
//         console.log("DB CURRENT USER:", result.rows[0].current_user);
//         console.log("DB CURRENT DATABASE:", result.rows[0].current_database);
//     })
//     .catch((error) => {
//         console.error("❌ DATABASE CONNECTION FAILED");
//         console.error(error.message);
   // });

export default pool;