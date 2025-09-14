import { Router } from "express";
import type {Response, Request} from "express"
// import prisma from "../lib/prisma.js"

const router = Router()


router.get('/', (req: Request, res: Response) => {
    res.send('Hello from the user Service!');
});

export default router;