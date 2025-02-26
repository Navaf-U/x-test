import axios, { isAxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3008",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isLoggingOut = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const response = await axios.post(
            `http://localhost:3008/api/auth/refreshToken`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = response.data.token;
          localStorage.setItem("token", newAccessToken);
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error("Refresh token failed, logging out user...",err);
        }
      }
      await axios.post(`http://localhost:3008/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      isLoggingOut = true;
    }

    return Promise.reject(error);
  }
);

export const axiosErrorCatch = (error: unknown): string => {
    if (isAxiosError(error)) {
      if (error.response) {
        return (
          error.response.data?.message ||
          `Error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        return "No response received from the server. Please try again later.";
      } else {
        return `Error in request setup: ${error.message}`;
      }
    } else if (error instanceof Error) {
      return `${error.message}`;
    } else {
      return "An unknown error occurred. Please try again.";
    }
  };
  


export default axiosInstance;