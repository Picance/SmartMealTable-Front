import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./SplashPage.css";

const SplashPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, member } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        if (member?.isOnboardingComplete) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding/profile", { replace: true });
        }
      } else {
        navigate("/login-options", { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, member, navigate]);

  return (
    <div className="splash-page">
      <div className="splash-content">
        <div className="splash-logo">
          <h1 className="logo-text">알뜰식탁</h1>
          <p className="logo-subtitle">SmartMealTable</p>
        </div>
        <div className="splash-loader">
          <div className="loader-spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
