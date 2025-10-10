import { Router } from "express";
import type {Response, Request} from "express"
import { requireAuth } from "../middleware/auth.js";
import { deleteUsercontroller, getMyProfile, updateProfileController } from "../controllers/users.controller.js";

const router = Router()


router.get('/me', requireAuth, getMyProfile)
router.put('/me', requireAuth, updateProfileController)
router.delete('/me', requireAuth, deleteUsercontroller)

export default router;