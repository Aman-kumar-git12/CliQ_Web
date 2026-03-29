
import axios from "axios";

const pro = import.meta.env.VITE_BACKEND_URL;

const axiosClient = axios.create({
  baseURL: pro,   // your backend  URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to send cookies with requests
});

// Add a response interceptor for cold start mitigation
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If there's no response (likely a timeout, CORS, or network error)
    if (!error.response) {
      // Initialize retry count
      const config = error.config;
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 2) {
        config._retryCount += 1;
        console.warn(`Backend unreachable, retrying (${config._retryCount}/2) in 3 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return axiosClient(config);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;