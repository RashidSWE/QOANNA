import { Router } from "express"
import prisma from "../lib/prisma.js"
import { hashPassword, verifyPassword } from "../lib/hash.js"
import { signAccessToken, SignEmailVerificationToken, signRefreshToken } from "../lib/jwt.js"
import { verifyToken } from "../lib/jwt-verifier.js"
import { add } from "date-fns"
import jwt from "jsonwebtoken";
import type { Request, Response } from 'express'
import { verifyEmailController } from "../controllers/auth.controller.js"
import { sendVerificationEmail } from "../lib/emailSender.js"


const router = Router()


router.post("/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: "User with this email already exists" })

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: { email, passwordHash, name },
    });

    const { token: EmailVerificationToken, jwtId: verifyEmailjti } = SignEmailVerificationToken(user.id)
    const verifyTokenExp = add(new Date(), { hours: 1 });
    
    await prisma.user.update({
        where: { id: user.id }, 
        data: { verificationToken: EmailVerificationToken, verifyTokenExp},
    })

    await sendVerificationEmail(user.email, EmailVerificationToken)
    res.json({
        message: "Registration Successful. Email verification link has been sent to your email. Verify email to activate your account "
    })
});

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: "Invalid credentials" })
    
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: "Invalid credentials" })
    
    if (!user.isVerfied) {
        const {token: EmailVerficationToken, jwtId: verifyEmailjti} = SignEmailVerificationToken(user.id)
        await sendVerificationEmail(user.email, EmailVerficationToken)
        return res.status(403).json({message: "Email not verified please verify email before login. link has been sent to your email"})
    }
    
    const { token: accessToken, jwtId: accessjti } = signAccessToken(user.id, user.role)
    const { token: refreshToken, jwtId: refreshjti } = signRefreshToken(user.id);

    await prisma.session.create({
        data: {
            userId: user.id,
            jwtId: refreshjti,
            expiresAt: add(new Date(), { days: 7 }),
        },
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.json({ accessToken });
});

router.post("/refresh", async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies

    if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(400).json({ message: "Refresh token is required and must be a string" })
    }
    try {
        const payload = verifyToken(refreshToken)
        if (typeof payload.jti !== 'string') {
            console.warn("valid token but 'jti' claim is missing or not a string", payload)
            return res.status(401).json({ message: "Invalid JWT ID in token." });
        }
        const session = await prisma.session.findUnique({
            where:
                { jwtId: payload.jti }
        })

        if (!session) {
            return res.status(400).json({ message: "Your session is not found or Expired. please try again later" })
        }
        
        if (typeof payload.sub !== 'string') {
            console.error("Token refresh Failed: sub( subject ) claim is missing or not a string in the payload.");
            return res.status(401).json({ message: "invalid token structure: missing user identifier" })
        }
    
        const { token: accessToken } = signAccessToken(payload.sub, payload.role)
        res.json({ accessToken })
    } catch (error: any) {
        console.error("Token refresh faild:", error.message)
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "refresh Token expired" })
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "invalid Refresh Token" })
        }

        res.status(500).json({ message: "An unexpected error ocurred during refresh token." });
    }
});

router.post("/logout", async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies
    
    if (refreshToken) {
        try {
            const payload = verifyToken(refreshToken)
            await prisma.session.delete({ where: { jwtId: payload.jti } })
            
        } catch (error) {
            console.error("Logout error", error);
        }
    }

    res.clearCookie(refreshToken)
    res.json({ message: "Logged out successfully"})
})

router.get("/verify-email/:token", verifyEmailController);


export default router;