import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: ["./auth-schema.ts", "./chat-schema.ts"],
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});