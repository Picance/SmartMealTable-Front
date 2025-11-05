/**
 * 카카오 OAuth 인증 관련 유틸리티 함수
 */

// 카카오 OAuth 설정
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";

/**
 * 카카오 OAuth 인증 URL 생성
 * @returns 카카오 로그인 URL
 */
export const getKakaoAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: "code",
    prompt: "login",
  });

  return `${KAKAO_AUTH_URL}?${params.toString()}`;
};

/**
 * URL에서 인증 코드 추출
 * @param url 현재 URL 또는 쿼리 스트링
 * @returns 인증 코드 또는 null
 */
export const extractAuthCodeFromUrl = (url: string): string | null => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("code");
};

/**
 * URL에서 에러 정보 추출
 * @param url 현재 URL 또는 쿼리 스트링
 * @returns 에러 정보 또는 null
 */
export const extractErrorFromUrl = (url: string): string | null => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("error");
};

/**
 * 카카오 로그인 팝업 열기
 * @returns Promise<인증 코드>
 */
export const openKakaoLoginPopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authUrl = getKakaoAuthUrl();
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "Kakao Login",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error("팝업이 차단되었습니다. 팝업 차단을 해제해주세요."));
      return;
    }

    // 팝업 감지 인터벌
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          reject(new Error("로그인이 취소되었습니다."));
          return;
        }

        // 리다이렉트된 URL 확인
        if (popup.location.href.includes(KAKAO_REDIRECT_URI)) {
          const code = extractAuthCodeFromUrl(popup.location.href);
          const error = extractErrorFromUrl(popup.location.href);

          if (error) {
            clearInterval(checkPopup);
            popup.close();
            reject(new Error(`카카오 로그인 실패: ${error}`));
            return;
          }

          if (code) {
            clearInterval(checkPopup);
            popup.close();
            resolve(code);
            return;
          }
        }
      } catch (e) {
        // CORS 에러는 무시 (다른 도메인에 있을 때)
      }
    }, 500);

    // 타임아웃 (5분)
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error("로그인 시간이 초과되었습니다."));
    }, 5 * 60 * 1000);
  });
};

/**
 * 카카오 로그인 페이지로 리다이렉트 (전체 페이지 방식)
 */
export const redirectToKakaoLogin = (): void => {
  const authUrl = getKakaoAuthUrl();
  window.location.href = authUrl;
};
