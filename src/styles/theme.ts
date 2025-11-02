// 모바일 웹뷰에 최적화된 테마 설정
export const theme = {
  // 모바일 웹뷰 최적화 크기
  mobile: {
    maxWidth: "430px", // iPhone 14 Pro Max 기준
    minWidth: "360px", // 최소 모바일 크기
    defaultWidth: "390px", // iPhone 14 Pro 기준
  },

  // 색상 팔레트
  colors: {
    primary: "#00796b",
    primaryLight: "#4db6ac",
    primaryDark: "#004d40",
    secondary: "#ffa726",
    secondaryDark: "#f57c00",
    accent: "#ff6b35",
    kakao: "#fee500",
    google: "#ffffff",
    googleBorder: "#dadce0",
    gray: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    text: {
      primary: "#000000",
      secondary: "#3c4043",
      tertiary: "#666666",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f8f9fa",
    },
  },

  // 타이포그래피
  typography: {
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2rem", // 32px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // 간격
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "3rem", // 48px
  },

  // 그림자
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    base: "0 2px 4px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 8px 16px rgba(0, 0, 0, 0.1)",
  },

  // 테두리
  borderRadius: {
    sm: "4px",
    base: "8px",
    md: "12px",
    lg: "16px",
    full: "9999px",
  },
};

export type Theme = typeof theme;
