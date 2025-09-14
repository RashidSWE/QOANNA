import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../lib/jwt-verifier.js"

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers["authorization"]
    if (!header) return res.status(401).json({ error: "Missing Authorization Header" })
    const token = header.split(" ")[1]
    
    if (!token) {
        return res.status(401).json({ error: "Malformed Authorization Header" });
    }
    
    try {
        const payload = verifyToken(token);
        (req as any).user = payload;
        next()
    } catch (error) {
         return res.status(401).json({ error: "Invalid or expired token" });
    }
}