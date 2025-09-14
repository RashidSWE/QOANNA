import jwt from "jsonwebtoken";

function getJwtPublicKey(): string {
    const key = process.env.JWT_PUBLIC_KEY;
    if (!key) {
        console.error("Critical error: JWT_PUBLIC_KEY environment variable is not set.");
        // A more graceful shutdown is often preferred outside of simple scripts
        throw new Error("JWT_PUBLIC_KEY environment variable is not set.");
    }
    return key.replace(/\\n/g, "\n");
}


const public_key: string = getJwtPublicKey();

export function verifyToken(token: string) {
    return jwt.verify(token, public_key, { algorithms: ["RS256"] }) as jwt.JwtPayload;
}

