import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
    plugins: [expo()],
    trustedOrigins: ["http://127.0.0.1:8000"],
    custom: {
        enabled: true, // Enable authentication using custom provider.
    },
});