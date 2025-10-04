import type { Request, Response } from "express"
import prisma from "../lib/prisma.js"
import { verifyToken } from '../lib/jwt-verifier.js';

export const verifyEmailController = async (req: Request, res: Response) => {
    const { token } = req.params

    if (!token) {
        return res.status(400).json({ message: "Verfication token is requried" });
    }
    
    try {
        const payload = verifyToken(token)

        const userId = payload.sub

        await prisma.user.update({
            where: { id: userId },
            data: { isVerfied: true, verificationToken: null, verifyTokenExp: null }
        });

        return res.status(200).json({ message: "Email verifeid successfully." });
    } catch (err) {
        console.error(err)
        return res.status(400).json({ message: "Invalid or expired verification token" });
    }
};