import type { Request, Response } from "express"
import prisma from "../lib/prisma.js"

/**
 * 
 * @param req 
 * @param res
 * @desc Get current user profile
 * @returns user
 */

export const getMyProfile = async (req: Request, res: Response) => {
        const userId = (req as any).user?.sub


        if (!userId) {
                return res.json({meassage: "User id not found"})
        }

        const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, email: true, phone: true, bio: true, avatarUrl: true }
                
        });
        res.json(user)
}

/**
 * @description update current user
 */

export const updateProfileController = async (req: Request, res: Response) => {
        try {
                const userId = (req as any).user?.sub

                if (!userId) {
                        return res.status(401).json({ message: "No Authorized Access"})
                }

                const { name, avatarUrl, bio, phone } = req.body

                const updatedUser = await prisma.user.update({
                        where: { id: userId },
                        data: {
                                name,
                                avatarUrl,
                                bio,
                                phone
                        },
                        select: {
                                name: true,
                                avatarUrl: true,
                                bio: true,
                                email: true,
                                phone: true,
                                updatedAt: true
                        }
                });

                res.json(updatedUser)
        } catch (error) {
                res.status(500).json({ message: "Failed to update user profile", error})
        }
}

/**
 * @description Delete current user
 * @param req 
 * @param res 
 * @returns 
 */

export const deleteUsercontroller = async (req: Request, res: Response) => {
        try {
                const userId = (req as any).user?.sub

                if (!userId) {
                        return res.status(401).json({ message: "Not Authorized"})
                }

                await prisma.user.delete({
                        where: { id: userId }
                });

                res.json({ message: "Account deleted successfully"})
        } catch (error) {
                res.status(500).json({ message: "error deleting account please contact customer support", error})
        }
}