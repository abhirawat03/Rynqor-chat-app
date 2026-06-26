import axios from "axios";

const Api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});

let refreshPromise = null;

const redirectToLogin = () => {
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth";
  }
};

Api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const code = error.response?.data?.code;

    // Skip refresh endpoint itself
    if (
      originalRequest?.url?.includes("/auth/refresh-token") ||
      originalRequest?.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (code === "ACCESS_TOKEN_EXPIRED" || code === "ACCESS_TOKEN_MISSING");

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/refresh-token`,
              {},
              { withCredentials: true },
            )
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;

        return Api(originalRequest);
      } catch (refreshError) {
        const refreshCode = refreshError.response?.data?.code;

        if (
          refreshCode === "REFRESH_TOKEN_MISSING" ||
          refreshCode === "REFRESH_TOKEN_INVALID" ||
          refreshCode === "REFRESH_TOKEN_EXPIRED" ||
          refreshCode === "REFRESH_TOKEN_REVOKED"
        ) {
          redirectToLogin();
        }

        return Promise.reject(refreshError);
      }
    }

    if (code === "ACCESS_TOKEN_INVALID") {
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default Api;
