import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

/**
 * Fetches the latest onboarding completion flag from the server,
 * syncs it to the auth store, and returns the resolved value.
 *
 * Call this helper after login only when the backend already reports the
 * account as fully onboarded so new users stay on the onboarding flow even if
 * the status endpoint behaves unexpectedly.
 */
export const syncOnboardingStatus = async (
  fallbackStatus: boolean
): Promise<boolean> => {
  try {
    const response = await authService.getOnboardingStatus();

    if (response.result === "SUCCESS" && response.data) {
      const { isOnboardingComplete } = response.data;
      const { updateMember } = useAuthStore.getState();
      updateMember({ isOnboardingComplete });
      return isOnboardingComplete;
    }
  } catch (error) {
    console.error("온보딩 상태 조회 실패:", error);
  }

  return fallbackStatus;
};
