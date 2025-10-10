import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Member {
  memberId: number;
  name: string;
  email: string;
  nickname?: string;
  isOnboardingComplete: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  member: Member | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (member: Member, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateMember: (member: Partial<Member>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      member: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (member, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({
          isAuthenticated: true,
          member,
          accessToken,
          refreshToken,
        });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          isAuthenticated: false,
          member: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      updateMember: (updatedData) => {
        set((state) => ({
          member: state.member ? { ...state.member, ...updatedData } : null,
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
