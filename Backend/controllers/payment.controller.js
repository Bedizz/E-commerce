import {stripe} from "../utils/stripe.js";
import Coupon from "../models/coupon.model.js"
import Order from "../models/order.model.js"
export const createCheckoutSession = async (req, res) => {
    const {products,couponCode} = req.body
    try {

        // Check if the cart is empty 
        if(!Array.isArray(products) || products.length === 0){
            return res.status(400).json({message:"Cart is empty"})
        }
        let totalAmount = 0;
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100) // Convert to cents because stripe uses cents
            totalAmount += amount * product.quantity

            // Return the line item object for each product in the cart 
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }
        })
        let coupon = null;
        if(couponCode) {
            // Check if the coupon code is valid
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive:true})
            if(coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100)
            }
            if(!coupon){
                return res.status(400).json({message:"Invalid coupon code"})
            }
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
            // customer_email: req.user.email,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                }
            ] : [],
            metadata: {  // This is a good place to save the user id and coupon id 
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))),
            },
        })
        if(totalAmount >= 20000) {// 200 dollars ==> 200.00
        await newCoupon(req.user._id) }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 })

        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// this function creates a new coupon in stripe and returns the coupon id 
const createStripeCoupon = async (discountPercentage) => {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })
    return coupon.id
}
// this function creates a new coupon in the database and returns the coupon object 
const newCoupon =  async (userId) => {
    const newCoupon = new Coupon({
        code: "GIFT"+ Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 *60 *60 *1000), // 30 days from now
        userId: userId,
    })
    await newCoupon.save()
    return newCoupon
}

export const checkoutSuccess = async (req,res) => {
    try {
        const {sessionId} = req.body
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        // Check if the payment was successful
        if(session.payment_status === "paid"){
            // Do something after the payment is successful
            if(session.metadata.couponCode) {
                // Deactivate the coupon code
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                },{
                    isActive: false
                })
            }
            // create a new order in the database
            const products = JSON.parse(session.metadata.products)
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(p => ({
                    product: p.id,
                    quantity: p.quantity,
                    price: p.price
                })),
                totalAmount: session.amount_total / 100, // Convert back to dollars
                stripeSessionId: sessionId,
            })
             await newOrder.save()
        }
    } catch (error) {
        res.status(500).json({message:error.message})
        
    }
}