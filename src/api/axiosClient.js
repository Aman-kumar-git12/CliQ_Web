
import axios from "axios";


const axiosClient = axios.create({
  baseURL: "http://localhost:2000",   // your backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies with requests
});

export default axiosClient;