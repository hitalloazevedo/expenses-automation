import { loadEnv } from "./load-env.js";
import { configDotenv } from "dotenv";

configDotenv();

const config = {
    database: {
        url: loadEnv('DATABASE_URL')
    }
}

export { config };