import express from "express"
import { getAllProducts,featuredProducts,createProduct,deleteProduct,recommendedProducts,getProductsByCategory,toggleFeaturedProduct } from "../controllers/product.controller.js"
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()


router.get("/featured",featuredProducts)
router.get("/category/:category",getProductsByCategory)
router.get("/recommendedProducts",recommendedProducts)
router.post("/",protectRoute,adminRoute,createProduct)
router.get("/products",protectRoute,adminRoute,getAllProducts)
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProduct)
router.post("/:id",protectRoute,adminRoute,deleteProduct)

export default router