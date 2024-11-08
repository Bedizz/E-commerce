import express from 'express';
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productsRoutes from "./routes/products.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import { connectDB } from './db/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import analyticsRoutes from './routes/analytics.route.js';



dotenv.config()


const app = express();

const PORT = process.env.PORT || 5000
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json({limit : "10mb"}))
app.use(cookieParser())

//routes
app.use("/api/auth", authRoutes)
app.use("/api/products",productsRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:`+PORT)
    connectDB();
})