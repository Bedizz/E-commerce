import {create} from "zustand";
import toast from "react-hot-toast"
import axios from "../lib/axios"


export const useProductStore = create((set) => ({  
    products: [],
    loading : false,
    setProducts: (products) => set({products}),

	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await axios.post("/products", productData);
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},
	fetchAllProducts: async () => {
		set({ loading: true });
		try {
			const res = await axios.get("/products");
			set({ products: res.data.products, loading: false });
		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},
	deleteProduct : async (productId) => {
		set({loading: true})
		try {
			await axios.post(`/products/${productId}`);
			set((prevState) => ({
				products: prevState.products.filter((product) => product._id !== productId),
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({loading: false})
		}
	},
	toggleFeaturedProduct: async (productId) => {
		set({loading: true})
		try {
			const res = await axios.patch(`/products/${productId}`);
			set((prevState) => ({
				products: prevState.products.map((product) =>
					product._id === productId ? {...product, isFeatured: res.data.isFeatured} : product
				),
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({loading: false})
		}
	},
	fetchProductsByCategory: async (category) => {
		set({loading: true})
		try {
			const res = await axios.get(`/products/category/${category}`);
			set({products: res.data.products, loading: false})
		} catch (error) {
			toast.error(error.response.data.error);
			set({loading: false})
		}
	},
	fetchFeaturedProducts: async () => {
		set({loading: true})
		try {
			const res = await axios.get("/products/featured");
			console.log(res.data)
			set({products: res.data, loading: false})
		} catch (error) {
			set({loading: false, error: "cant fetch featured products"})
		}
	}
}))