import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useCurrentUserQuery,
} from "../hooks/auth/useCurrentUserQuery.js";

const ProtectedRoute =
  () => {

    const {
      data: currentUser,
      isLoading,
    } = useCurrentUserQuery();

    if (isLoading) {

      return null;

      // or splash loader
    }

    if (!currentUser) {

      return (
        <Navigate
          to="/auth"
          replace
        />
      );

    }

    return <Outlet />;

  };

export default ProtectedRoute;