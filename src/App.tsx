import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { NavermapsProvider } from "react-naver-maps";
import { useAuthStore } from "./store/authStore";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";

// Pages
import SplashPage from "./pages/auth/SplashPage";
import LoginOptionsPage from "./pages/auth/LoginOptionsPage";
import EmailLoginPage from "./pages/auth/EmailLoginPage";
import EmailSignupPage from "./pages/auth/EmailSignupPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import KakaoCallbackPage from "./pages/auth/KakaoCallbackPage";

// Onboarding
import OnboardingProfilePage from "./pages/onboarding/OnboardingProfilePage";
import OnboardingAddressPage from "./pages/onboarding/OnboardingAddressPage";
import OnboardingBudgetPage from "./pages/onboarding/OnboardingBudgetPage";
import OnboardingPreferencePage from "./pages/onboarding/OnboardingPreferencePage";
import OnboardingFoodPreferencePage from "./pages/onboarding/OnboardingFoodPreferencePage";
import OnboardingPolicyPage from "./pages/onboarding/OnboardingPolicyPage";

// Main App
import HomePage from "./pages/home/HomePage";
import RecommendationPage from "./pages/recommendation/RecommendationPage";
import StoreDetailPage from "./pages/store/StoreDetailPage";
import MenuDetailPage from "./pages/menu/MenuDetailPage";
import CartPage from "./pages/cart/CartPage";
import SpendingPage from "./pages/spending/SpendingPage";
import CreateExpenditurePage from "./pages/spending/CreateExpenditurePage";
import ExpenditureDetailPage from "./pages/spending/ExpenditureDetailPage";
import ExpenditureSuccessPage from "./pages/spending/ExpenditureSuccessPage";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import ProfilePage from "./pages/profile/ProfilePage";
import BudgetManagementPage from "./pages/budget/BudgetManagementPage";
import FoodPreferencePage from "./pages/preference/FoodPreferencePage";
import SettingsPage from "./pages/settings/SettingsPage";
import AffiliationPage from "./pages/profile/AffiliationPage";
import AddressManagementPage from "./components/address/AddressManagementPage";
import AddressMapPage from "./components/address/AddressMapPage";
import AddressDetailPage from "./components/address/AddressDetailPage";

// Debug Page
import DebugAuthPage from "./pages/test/DebugAuthPage";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const location = useLocation();
  const { isAuthenticated, member } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login-options"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requireOnboarding && member && !member.isOnboardingComplete) {
    return (
      <Navigate
        to="/onboarding/profile"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <NavermapsProvider
        ncpKeyId={import.meta.env.VITE_NAVER_MAP_CLIENT_ID}
        submodules={["geocoder"]}
      >
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<SplashPage />} />
            <Route path="/login-options" element={<LoginOptionsPage />} />
            <Route path="/login" element={<EmailLoginPage />} />
            <Route path="/signup" element={<EmailSignupPage />} />
            <Route
              path="/oauth/google/callback"
              element={<GoogleCallbackPage />}
            />
            <Route
              path="/oauth/kakao/callback"
              element={<KakaoCallbackPage />}
            />

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
              path="/onboarding/food-preference"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <OnboardingFoodPreferencePage />
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
              path="/menu/:menuId"
              element={
                <ProtectedRoute>
                  <MenuDetailPage />
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
              path="/spending/success"
              element={
                <ProtectedRoute>
                  <ExpenditureSuccessPage />
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
            <Route
              path="/profile/budget"
              element={
                <ProtectedRoute>
                  <BudgetManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/preference"
              element={
                <ProtectedRoute>
                  <FoodPreferencePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliation"
              element={
                <ProtectedRoute>
                  <AffiliationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/address/management"
              element={
                <ProtectedRoute>
                  <AddressManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/address/map"
              element={
                <ProtectedRoute>
                  <AddressMapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/address/detail"
              element={
                <ProtectedRoute>
                  <AddressDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Debug Route */}
            <Route path="/debug/auth" element={<DebugAuthPage />} />

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NavermapsProvider>
    </ThemeProvider>
  );
}

export default App;
