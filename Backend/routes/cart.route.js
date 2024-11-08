import express from 'express';
import { addToCart, deleteAllFromCart,updateQuantity,getCartProducts,deleteAllCart } from '../controllers/cart.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.get("/",protectRoute,getCartProducts)
router.post("/",protectRoute,addToCart)
router.delete("/:productId",protectRoute,deleteAllFromCart)
router.delete("/",protectRoute,deleteAllCart)
router.put("/:id",protectRoute,updateQuantity)

export default router