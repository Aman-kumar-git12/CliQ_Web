
import axios from "axios";

const pro = import.meta.env.VITE_BACKEND_URL;

const axiosClient = axios.create({
  baseURL: pro,   // your backend  URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies with requests
});

export default axiosClient;