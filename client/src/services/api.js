import axios from "axios";

const Api = axios.create({

  baseURL:
    `${import.meta.env.VITE_BACKEND_URL}/api/v1`,

  withCredentials: true,

});

Api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    console.log(
      "Interceptor caught:",
      error.response?.data
    );

    // ---------------------------------
    // PREVENT REFRESH LOOP
    // ---------------------------------

    if (
      originalRequest?.url?.includes(
        "/auth/refresh-token"
      ) ||

      originalRequest?.url?.includes(
        "/auth/logout"
      )
    ) {

      return Promise.reject(
        error
      );

    }

    const code =
      error.response?.data?.code;

    // ---------------------------------
    // REFRESH ACCESS TOKEN
    // ---------------------------------

    if (

      error.response?.status === 401 &&

      !originalRequest._retry &&

      (
        code === "TOKEN_EXPIRED" ||

        code === "TOKEN_MISSING"
      )

    ) {

      originalRequest._retry = true;

      try {

        console.log(
          "Refreshing token..."
        );

        // refresh token request
        await Api.post(
          "/auth/refresh-token"
        );

        console.log(
          "Retrying request..."
        );

        // retry original request
        return Api(
          originalRequest
        );

      } catch (refreshError) {

        console.error(
          "Refresh failed:",
          refreshError
        );

        // session truly expired
        if (
          window.location.pathname !==
          "/auth"
        ) {

          window.location.href =
            "/auth";

        };

        return Promise.reject(
          refreshError
        );

      }

    }

    return Promise.reject(
      error
    );

  }
);

export default Api;