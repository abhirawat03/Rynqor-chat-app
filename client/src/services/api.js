import axios from "axios";

const Api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

/**
 * Routes that should NEVER trigger refresh logic
 */
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh-token",
];

/**
 * Resolve/reject queued requests
 */
const processQueue = (error = null) => {

  failedQueue.forEach((promise) => {

    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }

  });

  failedQueue = [];

};

Api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    /**
     * Network/server crash
     */
    if (!error.response) {
      return Promise.reject(error);
    }

    const isUnauthorized =
  error.response.status === 401;

const errorCode =
  error.response?.data?.errorCode;

const shouldRefresh =
  isUnauthorized &&
  errorCode === "TOKEN_EXPIRED";

const isAuthRoute =
  AUTH_ROUTES.some((route) =>
    originalRequest?.url?.includes(route)
  );

    /**
     * Skip refresh logic for:
     * - auth routes
     * - already retried requests
     */
    if (
  !shouldRefresh ||
  originalRequest._retry ||
  isAuthRoute
) {

      return Promise.reject(error);

    }

    /**
     * Queue requests while refresh is happening
     */
    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        failedQueue.push({
          resolve,
          reject,
        });

      }).then(() => Api(originalRequest));

    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {

      /**
       * Refresh access token
       * Browser automatically sends refresh cookie
       */
      await Api.post("/auth/refresh-token");

      /**
       * Retry queued requests
       */
      processQueue();

      /**
       * Retry original request
       */
      return Api(originalRequest);

    } catch (refreshError) {

      /**
       * Reject all queued requests
       */
      processQueue(refreshError);

      /**
       * Redirect only if NOT already on auth page
       */
      if (
        window.location.pathname !== "/auth"
      ) {

        window.location.href = "/auth";

      }

      return Promise.reject(refreshError);

    } finally {

      isRefreshing = false;

    }

  }
);

export default Api;