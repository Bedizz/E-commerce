import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/",
    withCredentials: true, // this will allow us to send cookies with the request to the server
});

export default axiosInstance;
