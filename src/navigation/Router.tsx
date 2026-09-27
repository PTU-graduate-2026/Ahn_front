import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Introduce from "../Screens/IntroduceScreen/Introduce";
import Login from "../Screens/LoginScreen/login";
import FileUploadScreen from "../Screens/FileUploadScreen";
import ScanResultScreen from "../Screens/ScanResultScreen";
import AnalysisHistoryScreen from "../Screens/AnalysisHistoryScreen";
import ScanLoadingScreen from "../Screens/ScanLoadingScreen";
import DashboardScreen from "../Screens/DashboardScreen";
import SignUp from "../Screens/LoginScreen/signup";
import ForgotPassword from "../Screens/LoginScreen/ForgotPassword";
import ResetPassword from "../Screens/LoginScreen/ResetPassword";
import FindId from "../Screens/LoginScreen/FindId";
import ProtectedRoute from "./ProtectedRoute";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/find-id" element={<FindId />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Introduce />} />
        <Route path="/intro" element={<Introduce />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <FileUploadScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AnalysisHistoryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan-loading/:fileSeq"
          element={
            <ProtectedRoute>
              <ScanLoadingScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan-result/:fileSeq"
          element={
            <ProtectedRoute>
              <ScanResultScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
