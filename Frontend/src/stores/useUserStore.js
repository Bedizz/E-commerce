import {create} from 'zustand';
import axios from '../lib/axios'
import {toast} from "react-hot-toast";

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signUp: async ({name,email, password,confirmPassword}) => {
        set({loading: true});
        if(password !== confirmPassword){
            set({loading: false});
            return toast.error("Passwords do not match");
        }
        try {
            const res = await axios.post("/auth/signup", {name,email, password});
            set({ user: res.data, loading: false });
            toast.success("Account created successfully");
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    login: async (email, password) => {
        set({loading: true});
        try {
            const res = await axios.post("/auth/login", {email, password});
            set({ user: res.data.user, loading: false });
            toast.success("Login successful");
            console.log(res.data)
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || "An error occurred");
        }
    },
    checkAuth: async () => {
        set({ checkingAuth: true});
        try {
            const response = await axios.get("/auth/profile");
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            set({checkingAuth: false, user: null});
        }
    },
    logOut: async () => {
        
        try {
            await axios.post("/auth/logout");
            set({ user: null})
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("An error occurred");
    }
    },
    refreshToken: async() => {
        if(get().checkingAuth) return;
        set({checkingAuth: true});
        try {
            const res = await axios.post("/auth/refresh-token");
            set({ checkingAuth: false})
            return response.data;
        } catch (error) {
            set({checkingAuth: false, user: null});
        }
    }

}));
    // interceptors kullanmalıyız çünkü token 15 dakika sonra expire oluyor ve kullanıcıyı otomatik olarak logout olacak. Bunu önlemek için bir interceptor kullanacağız. 
    // Bu interceptor kullanıcının token'ını refresh edecek ve kullanıcıyı logout yapmayacak.
    // Bu interceptor'ı kullanmak için axios.js dosyasına gidip axios instance'ına ekleyeceğiz.
let tokenRefreshRequest = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // if a refresh is already in progress, wait for it to finish
                if(tokenRefreshRequest) {
                    await tokenRefreshRequest;
                    return axios(originalRequest);
                }
                tokenRefreshRequest = useUserStore.getState().refreshToken();
                await tokenRefreshRequest;
                tokenRefreshRequest = null;
                return axios(originalRequest);
            } catch (refreshError) {
                useUserStore.getState().logOut();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
)

