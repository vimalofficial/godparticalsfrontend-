import { Route } from "react-router-dom";

import Root from "../pages/user/root";

import Login from "../pages/auth/Login";

import Home from "../pages/user/home/root";

import SingleProduct from "../pages/user/home/singeproduct";

import Orders from "../pages/user/orders/root";

import Cart from "../pages/user/cart/root";

import Wishlist from "../pages/user/wishlist/root";

import ProtectedRoute from "../components/ProtectedRoute";

const UserRoutes = () => {
  return (
    <>
      {/* Public */}

      <Route
        path="/"
        element={<Root />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected */}

      <Route
        path="/home"
        element={
          <ProtectedRoute role="user">
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute role="user">
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute role="user">
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute role="user">
            <Wishlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/product/:id"
        element={
          <ProtectedRoute role="user">
            <SingleProduct />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export default UserRoutes;