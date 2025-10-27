import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
    plugins: [expo()],
    trustedOrigins: ["http://172.20.10.2:8000"],
    custom: {
        enabled: true, // Enable authentication using custom provider.
    },
});