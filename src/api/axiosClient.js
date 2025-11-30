
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosClient = axios.create({
  baseURL: backendUrl,   // your backend  URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies with requests
});

export default axiosClient;