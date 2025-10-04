import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d"
const verifyEmailTokenTTL = "1hr"


function getJwtPrivateKey(): string {
    const key = process.env.JWT_PRIVATE_KEY;
    if (!key) {
        console.error("Critical error: JWT_PRIVATE_KEY environment variable is not set.");
        throw new Error("JWT_PRIVATE_KEY environment variable is not set.");
    }
    return key.replace(/\\n/g, "\n");
}

const private_key: string = getJwtPrivateKey()

export function signAccessToken(userId: string, role: string) {
    const jwtId = randomUUID();
    const payload = { sub: userId, role };
    return {
        token: jwt.sign(payload, private_key, {
            algorithm: "RS256",
            expiresIn: ACCESS_TOKEN_TTL,
            jwtid: jwtId
        }),
        jwtId,
    };
};

export function signRefreshToken(userId: string) {
    const jwtId = randomUUID()
    const payload = { sub: userId };
    return {
        token: jwt.sign(payload, private_key, {
            algorithm: "RS256",
            expiresIn: REFRESH_TOKEN_TTL,
            jwtid: jwtId
        }),
        jwtId,
    };
};

export function SignEmailVerificationToken(userId: string) {
    const jwtId = randomUUID()
    const payload = { sub: userId };
    return {
        token: jwt.sign(payload, private_key, {
            algorithm: "RS256",
            expiresIn: verifyEmailTokenTTL,
            jwtid: jwtId
        }),
        jwtId,
    };
}
