// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserShell } from '../components/layout/UserShell';
import { AdminShell } from '../components/layout/AdminShell';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Screen Imports
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { UserDashboard } from '../pages/UserDashboard';
import { AIMockInterviewSetup } from '../pages/AIMockInterviewSetup';
import { LiveAIInterviewRoom } from '../pages/LiveAIInterviewRoom';
import { CodingPractice } from '../pages/CodingPractice';
import { CompanyQuestions } from '../pages/CompanyQuestions';
import { PreparationResources } from '../pages/PreparationResources';
import { ResumeAnalyzer } from '../pages/ResumeAnalyzer';
import { Bookmarks } from '../pages/Bookmarks';
import { InterviewHistory } from '../pages/InterviewHistory';
import { AnalyticsDashboard } from '../pages/AnalyticsDashboard';
import { UserProfile } from '../pages/UserProfile';
import { Settings } from '../pages/Settings';
import { AdminDashboard } from '../pages/AdminDashboard';
import { NotFound } from '../pages/NotFound';

const withUserShell = (node: React.ReactNode) => (
  <ProtectedRoute>
    <UserShell>{node}</UserShell>
  </ProtectedRoute>
);

const withAdminShell = (node: React.ReactNode) => (
  <ProtectedRoute requiredRole="ADMIN">
    <AdminShell>{node}</AdminShell>
  </ProtectedRoute>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Landing & Authentication Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* 2. Protected User Application Routes wrapped in UserShell */}
      <Route path="/dashboard" element={withUserShell(<UserDashboard />)} />
      <Route path="/mock-interviews" element={withUserShell(<AIMockInterviewSetup />)} />
      <Route path="/mock-interviews/setup" element={withUserShell(<AIMockInterviewSetup />)} />
      <Route path="/mock-interviews/live" element={withUserShell(<LiveAIInterviewRoom />)} />
      <Route path="/mock-interviews/live/:sessionId" element={withUserShell(<LiveAIInterviewRoom />)} />
      <Route path="/coding-practice" element={withUserShell(<CodingPractice />)} />
      <Route path="/company-questions" element={withUserShell(<CompanyQuestions />)} />
      <Route path="/resources" element={withUserShell(<PreparationResources />)} />
      <Route path="/resume-analyzer" element={withUserShell(<ResumeAnalyzer />)} />
      <Route path="/bookmarks" element={withUserShell(<Bookmarks />)} />
      <Route path="/interview-history" element={withUserShell(<InterviewHistory />)} />
      <Route path="/analytics" element={withUserShell(<AnalyticsDashboard />)} />
      <Route path="/profile" element={withUserShell(<UserProfile />)} />
      <Route path="/settings" element={withUserShell(<Settings />)} />

      {/* 3. Admin Application Routes wrapped in AdminShell */}
      <Route path="/admin" element={withAdminShell(<AdminDashboard />)} />
      <Route path="/admin/*" element={withAdminShell(<AdminDashboard />)} />

      {/* 4. Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
