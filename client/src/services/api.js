import axios from "axios";

const Api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});


// RESPONSE INTERCEPTOR
Api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // avoid infinite loop
    if (
      error.response?.status === 401 &&
      error.response?.data?.errorCode === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {

        // refresh token request
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        // retry original request
        return Api(originalRequest);

      } catch (refreshError) {

        // refresh token invalid/expired
        window.location.href = "/auth";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default Api;