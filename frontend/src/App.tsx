import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { applyAegisTheme } from '@/lib/applyAegisTheme';
import { mergeUserSettings } from '@/lib/settingsDefaults';
import { setStoredLocale } from '@/i18n/locale';
import { PageFallback } from '@/components/PageFallback';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })));
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const SOSPage = lazy(() => import('@/pages/SOSPage').then((m) => ({ default: m.SOSPage })));
const HospitalsPage = lazy(() => import('@/pages/HospitalsPage').then((m) => ({ default: m.HospitalsPage })));
const MedicinesPage = lazy(() => import('@/pages/MedicinesPage').then((m) => ({ default: m.MedicinesPage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const RiskPage = lazy(() => import('@/pages/RiskPage').then((m) => ({ default: m.RiskPage })));
const FirstAidPage = lazy(() => import('@/pages/FirstAidPage').then((m) => ({ default: m.FirstAidPage })));

function ThemeLanguageEffects() {
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    applyAegisTheme(mergeUserSettings(user?.settings));
    if (user?.settings?.language) setStoredLocale(user.settings.language);
  }, [user?.settings]);
  return null;
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    applyAegisTheme(mergeUserSettings(user?.settings));
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <>
      <ThemeLanguageEffects />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="sos" element={<SOSPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="medicines" element={<MedicinesPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="first-aid" element={<FirstAidPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
