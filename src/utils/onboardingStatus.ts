import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

/**
 * Fetches the latest onboarding completion flag from the server,
 * derives a safe "complete" flag, syncs it to the auth store, and returns it.
 *
 * The derived flag requires both the backend's completion flag and the
 * prerequisite onboarding steps to be satisfied, protecting brand-new users
 * from being misrouted when the raw flag is stale.
 */
export const syncOnboardingStatus = async (
  fallbackStatus: boolean = false
): Promise<boolean> => {
  try {
    const response = await authService.getOnboardingStatus();

    if (response.result === "SUCCESS" && response.data) {
      const {
        isOnboardingComplete,
        hasSelectedRecommendationType,
        hasConfirmedMonthlyBudget,
      } = response.data;

      const derivedComplete = Boolean(
        isOnboardingComplete &&
          hasSelectedRecommendationType &&
          hasConfirmedMonthlyBudget
      );
      const { updateMember } = useAuthStore.getState();
      updateMember({ isOnboardingComplete: derivedComplete });
      return derivedComplete;
    }
  } catch (error) {
    console.error("온보딩 상태 조회 실패:", error);
  }

  return fallbackStatus;
};
