import { redis } from "../db/redis.js"
import Product from "../models/product.model.js"

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find()
        res.status(201).json({message: "All products",products})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const featuredProducts = async (req,res) => {
    try {
        let featuredProducts = await redis.get("featured_products")
        if(featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts))
        }
        // lean() is used to convert mongoose object to plain javascript object
        featuredProducts = await Product.find({isFeatured: true}).lean()
        if(!featuredProducts) {
            return res.status(404).json({message: "No featured products found"})
        }
        // store in redis for future quick access

        await redis.set("featured_products", JSON.stringify(featuredProducts))
        res.status(200).json(featuredProducts)
    } catch (error) {
        res.status(500).json({message:error.message})

    }
}

export const createProduct = async (req,res) => {
try {
    const {name,description,image,price,category,quantity} = req.body
    let cloudinaryResponse = null
    if(image) {
        await cloudinary.uploader.upload(image, {folder: "products"})
    }
    const product = await Product.create({
        name,
        description,
        image: cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : "",
        price,
        category,
        quantity
    })

    res.status(201).json({message: "Product created successfully",product})
} catch (error) {
    res.status(500).json({message:error.message})
}
}

export const deleteProduct = async (req,res) => {
    try {
        const product = await Product.findById(req.params.id)
        if(!product) {
            return res.status(404).json({message: "Product not found"})
        }
        if(product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
            } catch (error) {
                res.status(500).json({message: "Server error during deleting image"})
            }
        }
        await Product.findByIdAndDelete(req.params.id)
        // await Product.deleteOne(product) // another way to delete
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const recommendedProducts = async (req,res) => {
    try {
        const products = await Product.aggregate([
            {$sample: {size: 3}},
            {$project: {name: 1,price: 1,description: 1,_id:1,image: 1}}
        ])
        res.status(200).json({message: "Recommended products",products})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const getProductsByCategory = async ( req,res ) => {
    const {category } = req.params
    try {
        const products = await Product.find({category})
        if(!products) {
            return res.status(404).json({message: "No products found for this category"})
        }
        res.status(200).json({message: `All products in ${category}`,products})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const toggleFeaturedProduct = async(req,res) => {
    try {
        const product = await Product.findById(req.params.id)
        if(!product) {
            return res.status(404).json({message: "Product not found"})
        }
        product.isFeatured = !product.isFeatured
        await product.save()
        await updateFeaturedProductsCache()
        res.status(200).json({message: "Product updated successfully",product})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const updateFeaturedProductsCache = async () => {
    try {
        const featuredProducts = await Product.find({isFeatured: true}).lean()
        await redis.set("featured_products", JSON.stringify(featuredProducts))

    } catch (error) {
        console.log("Error during updating featured products cache")
    }
}
