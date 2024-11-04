import express from "express"
import { adminRoute, protectRoute } from "../middleware/auth.middleware"
import { getAnalytics } from "../controllers/analytics.controller"


const router = express.Router()


router.get("/",protectRoute,adminRoute,getAnalytics)


export default router