import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
// import { useAuthStore } from "./store/authStore";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";

// Pages
import SplashPage from "./pages/auth/SplashPage";
import LoginOptionsPage from "./pages/auth/LoginOptionsPage";
import EmailLoginPage from "./pages/auth/EmailLoginPage";
import EmailSignupPage from "./pages/auth/EmailSignupPage";

// Onboarding
import OnboardingProfilePage from "./pages/onboarding/OnboardingProfilePage";
import OnboardingAddressPage from "./pages/onboarding/OnboardingAddressPage";
import OnboardingBudgetPage from "./pages/onboarding/OnboardingBudgetPage";
import OnboardingPreferencePage from "./pages/onboarding/OnboardingPreferencePage";
import OnboardingPolicyPage from "./pages/onboarding/OnboardingPolicyPage";

// Main App
import HomePage from "./pages/home/HomePage";
import RecommendationPage from "./pages/recommendation/RecommendationPage";
import StoreDetailPage from "./pages/store/StoreDetailPage";
import CartPage from "./pages/cart/CartPage";
import SpendingPage from "./pages/spending/SpendingPage";
import CreateExpenditurePage from "./pages/spending/CreateExpenditurePage";
import ExpenditureDetailPage from "./pages/spending/ExpenditureDetailPage";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import ProfilePage from "./pages/profile/ProfilePage";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  // requireOnboarding = true,
}) => {
  // const { isAuthenticated, member } = useAuthStore();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login-options" replace />;
  // }

  // if (requireOnboarding && member && !member.isOnboardingComplete) {
  //   return <Navigate to="/onboarding/profile" replace />;
  // }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/login-options" element={<LoginOptionsPage />} />
          <Route path="/login" element={<EmailLoginPage />} />
          <Route path="/signup" element={<EmailSignupPage />} />

          {/* Onboarding Routes */}
          <Route
            path="/onboarding/profile"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/address"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingAddressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/budget"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingBudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/preference"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPreferencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding/policy"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPolicyPage />
              </ProtectedRoute>
            }
          />

          {/* Main App Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation"
            element={
              <ProtectedRoute>
                <RecommendationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store/:storeId"
            element={
              <ProtectedRoute>
                <StoreDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spending"
            element={
              <ProtectedRoute>
                <SpendingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spending/create"
            element={
              <ProtectedRoute>
                <CreateExpenditurePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spending/:id"
            element={
              <ProtectedRoute>
                <ExpenditureDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
