import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { WorkoutListPage } from "@/pages/workout/WorkoutListPage";
import { WorkoutDetailPage } from "@/pages/workout/WorkoutDetailPage";
import { CategoryPage } from "@/pages/category/CategoryPage";
import { FriendsPage } from "@/pages/friends/FriendsPage";
import { FriendWorkoutsPage } from "@/pages/friends/FriendWorkoutsPage";
import { FriendHealthPage } from "@/pages/friends/FriendHealthPage";
import { StatsPage } from "@/pages/stats/StatsPage";
import { HealthPage } from "@/pages/health/HealthPage";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/workouts" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <WorkoutListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/:id"
            element={
              <ProtectedRoute>
                <WorkoutDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends/:id/workouts"
            element={
              <ProtectedRoute>
                <FriendWorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends/:id/health"
            element={
              <ProtectedRoute>
                <FriendHealthPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <HealthPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
