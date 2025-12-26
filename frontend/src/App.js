import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import MovieList from "./pages/customers/MovieList";
import MovieDetails from "./pages/customers/MovieDetails";
import Home from "./pages/customers/Home";
import AboutUs from "./pages/customers/AboutUs";
import MovieManager from "./pages/admin/MovieManager";
import AddMovieForm from "./pages/admin/AddMovieForm";
import EditMovieForm from "./pages/admin/EditMovieForm";
import Login from "./pages/customers/Login";
import Register from "./pages/customers/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/customers/ForgotPassword";
import ResetPassword from "./pages/customers/ResetPassword";
import ConfirmPassword from "./pages/customers/ConfirmPassword";
import UsersList from "./pages/admin/UsersList";
import { SearchProvider } from "./context/SearchContext";

function App() {
  const role = localStorage.getItem("role"); 

  return (
    <SearchProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              role === "admin" ? (
                <Navigate to="/admin/movies" />
              ) : (
                <Navigate to="/home" />
              )
            }
          />

          <Route
            path="/home"
            element={
              <PageLayout>
                <Home />
              </PageLayout>
            }
          />
          <Route
            path="/movies"
            element={
              <PageLayout>
                <MovieList />
              </PageLayout>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <PageLayout>
                <MovieDetails />
              </PageLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PageLayout>
                <AboutUs />
              </PageLayout>
            }
          />

          <Route
            path="/admin/movies"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <MovieManager />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies/add"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <AddMovieForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/movies/edit/:id"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <EditMovieForm />
                </PageLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roleRequired="admin">
                <PageLayout isAdmin={true}>
                  <UsersList />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-password" element={<ConfirmPassword />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageLayout>
                  <Profile />
                </PageLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <PageLayout>
                <h2>Page not found</h2>
              </PageLayout>
            }
          />
        </Routes>
      </Router>
    </SearchProvider>
  );
}

export default App;