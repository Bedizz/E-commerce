import {create } from 'zustand';
import axios from "../lib/axios"
import toast from 'react-hot-toast';

export const useCartStore = create((set,get) => ({    
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getCartItems: async() => {
        try {
            const res = await axios.get("/cart")
            set({cart: res.data})
            get().calculateTotal()
        } catch (error) {
            set({cart: []})
            toast.error("Failed to fetch cart items")
        }
    },
    addToCart: async(product) => {
        try {
             await axios.post("/cart",{productId: product._id})
            toast.success("Product added to cart")
            set((prevState) => {
                const existingItem = prevState.cart.find((item) => item._id === product._id)
                const newCart = existingItem ? prevState.cart.map((item) => item._id === product._id ? {...item, quantity: item.quantity + 1} : item) : [...prevState.cart , { ...product, quantity: 1}]
                
                return {cart: newCart}
            })
            get().calculateTotal()
        } catch (error) {
            toast.error("Failed to add product to cart")
        }
    },
    calculateTotal: () => {
        const {cart,coupon} = get();
        const subtotal = cart.reduce((sum,item) => sum + item.price * item.quantity, 0) 
        let total = subtotal;

        if(coupon) {
            const discount = subtotal *(coupon.discountPercentage / 100)
            total = subtotal - discount
        }
        set({subtotal,total})
    },
    removeFromCart: async(productId) => {
        try {
            await axios.delete(`/cart/${productId}`)
            set((prevState) => {
                const newCart = prevState.cart.filter((item) => item._id !== productId)
                get().calculateTotal()
                return {cart: newCart}
            })
            toast.success("Product removed from cart")
        } catch (error) {
            toast.error("Failed to remove product from cart")
        }
    },
	clearCart: async () => {
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
        try {
            await axios.delete("/cart")
            toast.success("Cart cleared")
        } catch (error) {
            toast.error("Failed to clear cart")
        }
        
	},
    updateQuantity: async(productId,quantity) => {
        if(quantity === 0 )  {
            get().removeFromCart(productId)
            return
        }
        await axios.put(`/cart/${productId}`,{quantity})
        set((prevState) => ({
            cart: prevState.cart.map((item) => (item._id === productId ? {...item, quantity} : item))
            
        }))
        get().calculateTotal()
    }
    ,
    getMyCoupon: async () => {
        try {
            const res = await axios.get("/coupons")
            set({coupon: res.data})

        } catch (error) {
            set({coupon: null})
        }
    },
    applyCoupon : async(code) => {
        try {
            const res = await axios.post ("/coupons/validate", {code})
            set({coupon: res.data, isCouponApplied: true})
            get().calculateTotal()
            toast.success("Coupon applied",{id: "coupon-applied"})
        } catch (error) {
            set({coupon: null})
            toast.error("Failed to apply coupon")
        }
    },
    removeCoupon: async() => {
        set({coupon: null, isCouponApplied: false})
        get().calculateTotal()
        toast.success("Coupon removed")
    }


}))