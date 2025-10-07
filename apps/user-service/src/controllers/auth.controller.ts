import type { Request, Response } from "express"
import prisma from "../lib/prisma.js"
import { verifyToken } from '../lib/jwt-verifier.js';
import { SignResetPasswordToken } from "../lib/jwt.js";
import { sendPasswordResetEmail } from "../lib/emailSender.js";
import { hashPassword } from "../lib/hash.js";

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

export const requestPasswordResetController = async (req: Request, res: Response) => {
    const { email } = req.body
    
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    const resetTokenExp = new Date(Date.now() + 15 * 60 * 1000)
    const { token: PasswordresetToken, jwtId: resetjti } = SignResetPasswordToken(user.id)
    
    await prisma.user.update({
        where: { id: user.id },
        data: {resetToken: PasswordresetToken, resetTokenExp}
    })

    await sendPasswordResetEmail(user.email, PasswordresetToken)

    res.json({message: "password reset link sent to your email."})
}

export const resetPasswordController = async (req: Request, res: Response) => {
    const { token } = req.params
    const { password } = req.body
    const { confirmPassword } = req.body

    if (!token) {
        return res.status(400).json({ message: "Reset Token Required" })
    }

    if (password !== confirmPassword) {
        return res.json({ message: "passwords do not match" })
    }
    try {

        const payload = verifyToken(token)

        const UserId = payload.sub

        const hashed = await hashPassword(password)

        await prisma.user.update({
            where: { id: UserId },
            data: {
                passwordHash: hashed,
                resetToken: null,
                resetTokenExp: null
            },
        });

        res.json({ message: "Password Reset successfully" })

    } catch (error: any) {
        console.error("Reset password error:", error.name, error.message);
        return res.status(400).json({
            message: "invalid or expired Token",
            error: { name: error.name, message: error.message },
        })
    }
};


