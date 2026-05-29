import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useCurrentUserQuery,
} from "../hooks/auth/useCurrentUserQuery.js";


const PublicRoute =
() => {

    const {
      data: currentUser,
      isLoading,
    } = useCurrentUserQuery();

    if (isLoading) {

      return null;

    }

    if (currentUser) {

      return (
        <Navigate
          to="/"
          replace
        />
      );

    }

    return <Outlet />;

  };

export default PublicRoute;