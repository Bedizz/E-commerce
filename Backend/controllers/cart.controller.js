import Product from "../models/product.model.js"

export const addToCart = async (req,res) => {
    const {productId} = req.body
    const user = req.user
    try {
        const existingItem = user.cartItems.find( item => item.id === productId)
        if(existingItem){
            existingItem.quantity += 1
        } else {
            user.cartItems.push(productId)
        }
        await user.save()
        res.status(201).json({message:"Product added to cart"})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const deleteAllFromCart = async (req,res) => {
    const {productId} = req.body
    const user = req.user
    try {
        if(!productId ) {
            user.cartItems = []
        } else {
            user.cartItems = user.cartItems.filter( item => item.id !== productId)
        }
        await user.save()
        res.status(201).json({message:"Product removed from cart"})
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }

}

export const updateQuantity = async (req,res) => {
    const {id:productId} = req.params;
    const {quantity} = req.body
    try {
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const getCartProducts = async (req,res) => {
    try {
        const products = await Product.find({$in: req.user.cartItems})
        //we should add the quantity of each product in the cart
        const cartItems = products.map( product => {
            const item = req.user.cartItems.find( item => item.id === product._id).quantity
            return {...product.toJSON(),quantity: item.quantity}
        })
        res.status(200).json(cartItems)
    } catch (error) {
        res.status(500).json({message:error.message})
        
    }
}