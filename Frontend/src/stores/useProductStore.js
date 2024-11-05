import {create} from "zustand";
import toast from "react-hot-toast"
import axios from "axios"


const useProductStore = create((set) => ({  
    products: [],
    loading : false,
    setProducts: (products) => set({products}),

    createProduct: async (newProduct) => {
        set({loading: true})
        try {
            const response = await axios.post("/products", newProduct);
            
            
        } catch (error) {
            
        }