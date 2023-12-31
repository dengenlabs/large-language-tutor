
import { configure } from "@language-tutor/interactions";
import dotenv from 'dotenv';

dotenv.config();

const serverUrl = process.env.SERVER_URL || "http://localhost:8089";

const Env = {
    xAccountHeader: process.env.X_ACCOUNT_HEADER || 'x-account-id',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    version: process.env.VERSION || "1.0.0",
    port: process.env.PORT || 8089,
    name: process.env.NAME || "Language Tutor",
    serverUrl,
    openai: process.env.OPENAI_API_KEY,
    google: {
        projectId: process.env.GOOGLE_PROJECT_ID,
    },
    db: {
        url: process.env.DB_URL,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    slack: {
        token: process.env.SLACK_TOKEN,
        defaultChannel: process.env.SLACK_CHANNEL ?? "#notifications-langtutor",
    },
    composable: {
        apiKey: process.env.COMPOSABLE_PROMPTS_API_KEY,
    }
};

if (!Env.composable.apiKey) {
    throw new Error("COMPOSABLE_PROMPTS_API_KEY environment variable must be set");
}

configure({
    apikey: Env.composable.apiKey,
});


export default Env;