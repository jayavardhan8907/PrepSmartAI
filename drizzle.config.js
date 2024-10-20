/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:zrTV0uad3GCe@ep-still-sea-a5880k3x.us-east-2.aws.neon.tech/MockInterview?sslmode=require',
    }
};